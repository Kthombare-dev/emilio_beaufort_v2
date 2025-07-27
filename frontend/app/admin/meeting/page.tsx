"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface Attendee {
  email: string;
}

interface Meeting {
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  attendees?: Attendee[];
  status?: string;
}

export default function MeetingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!auth.isAdmin()) {
      router.replace("/admin/login");
      return;
    }

    const loadMeetings = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/meetings");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch meetings");
        }
        const data = await response.json();
        console.log("Raw fetched meetings: ", data);

        // Map API data to Meeting interface (adjust based on actual Cal.com fields)
        const mapped: Meeting[] = data.map((m: any) => ({
          id: m.id || m.bookingId || "",
          title: m.title || m.name || "No title",
          startTime: m.start || m.startTime || m.start_time,
          endTime: m.end || m.endTime || m.end_time,
          attendees: Array.isArray(m.attendees)
            ? m.attendees.map((a: any) => ({ email: a.email || "unknown@example.com" }))
            : [],
          status: m.status || "UNKNOWN",
        }));

        // Filter upcoming and non-cancelled
        const now = new Date();
        const scheduled = mapped
          .filter(
            (m) =>
              m.status?.toUpperCase() !== "CANCELLED" &&
              m.startTime &&
              new Date(m.startTime) > now
          )
          .sort(
            (a, b) =>
              (new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime()) || 0
          );

        setMeetings(scheduled);
        setFilteredMeetings(scheduled);
      } catch (error: any) {
        console.error("Failed to load meetings:", error);
        toast.error(error.message || "Failed to load scheduled meetings");
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [router]);

  // Search/filter handler
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerTerm) ||
        m.attendees?.some((a) => a.email.toLowerCase().includes(lowerTerm))
    );
    setFilteredMeetings(filtered);
  }, [searchTerm, meetings]);

  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const toggleOpen = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Meetings</h1>
        <p className="text-gray-600">Your upcoming Cal.com meetings in a timeline view</p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <Input
          type="search"
          placeholder="Search by title or attendee email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Custom Accordion Timeline */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled meetings</h3>
          <p className="text-gray-500">Book a new meeting to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMeetings.map((meeting, index) => (
            <div
              key={meeting.id || index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleOpen(index)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 text-left flex items-center gap-4 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                  <p className="text-sm text-gray-600">{formatTime(meeting.startTime)}</p>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 py-4 bg-white">
                  <div className="space-y-4">
                    {/* Meeting Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Start: {formatTime(meeting.startTime)}
                        </p>
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" /> End: {formatTime(meeting.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <User className="h-4 w-4" /> Attendees:{" "}
                          {meeting.attendees && meeting.attendees.length > 0
                            ? meeting.attendees.map((a) => a.email).join(", ")
                            : "None"}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          Status: {meeting.status || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Meeting Link Below Details */}
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        variant="link"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2 p-0"
                        onClick={() =>
                          window.open(`https://cal.com/booking/${meeting.id}`, "_blank")
                        }
                      >
                        <LinkIcon className="h-4 w-4" /> View/Join Meeting on Cal.com
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          onClick={() => router.refresh()}
          variant="outline"
        >
          Refresh Meetings
        </Button>
      </div>
    </div>
  );
}
