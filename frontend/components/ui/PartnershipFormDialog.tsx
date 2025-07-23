"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// =============
// Zod Schema
// =============
const formSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .regex(/^[A-Za-z\s]+$/, "Special characters and numbers are not allowed"),
    company: z.string().min(2, "Company name must be at least 2 characters"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .refine((val) => val.endsWith("@gmail.com"), {
        message: "Only Gmail addresses ending with @gmail.com are allowed",
      }),
    inquiryType: z.enum(["supplier", "distributor", "other"]),
    otherInquiryType: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters"),
  })
  // Require `otherInquiryType` when 'other'
  .refine(
    (data) =>
      data.inquiryType !== "other" ||
      (data.otherInquiryType && data.otherInquiryType.trim().length >= 2),
    {
      message: "Please specify your inquiry type",
      path: ["otherInquiryType"],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface PartnershipFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CACHE_KEY = "partnership_inquiries";

function saveToCache(data: any) {
  try {
    const existingData = localStorage.getItem(CACHE_KEY);
    const inquiries = existingData ? JSON.parse(existingData) : [];
    inquiries.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem(CACHE_KEY, JSON.stringify(inquiries));
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
}

export default function PartnershipFormDialog({
  isOpen,
  onClose,
}: PartnershipFormDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      full_name: "",
      company: "",
      email: "",
      inquiryType: "supplier",
      otherInquiryType: "",
      message: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const onSubmit = async (data: FormData) => {
    if (!form.formState.isValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const submissionData = {
        full_name: data.full_name,
        email: data.email,
        company: data.company,
        message: data.message,
        inquiry_type:
          data.inquiryType === "other"
            ? data.otherInquiryType
            : data.inquiryType,
      };

      saveToCache(submissionData);

      await api.submitPartnershipInquiry(submissionData);

      setSubmittedName(data.full_name);
      setIsSuccess(true);
      form.reset();

      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-medium">Inquiry submitted successfully!</p>
          <p className="text-sm text-gray-600">
            We'll get back to you soon.
          </p>
        </div>
      );
    } catch (error: any) {
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-medium">Failed to submit inquiry</p>
          <p className="text-sm text-gray-600">
            {error?.message || "Unknown error occurred"}
          </p>
          <p className="text-xs text-gray-500">
            Please try again or contact support if the problem persists.
          </p>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setSubmittedName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">
                Partner With Us
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-gray-600 mb-6">
                Join our network of premium partners and help us bring luxury grooming
                to discerning customers worldwide.
              </p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => {
                      const containsInvalidChars = /[^A-Za-z\s]/.test(field.value);
                      return (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                              className={containsInvalidChars ? "border-yellow-500" : ""}
                            />
                          </FormControl>
                          {containsInvalidChars && (
                            <p className="text-sm text-yellow-600">
                              ⚠ Special characters and numbers are not allowed.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  {/* Company */}
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                      const isNotGmail =
                        field.value && !field.value.endsWith("@gmail.com");
                      return (
                        <FormItem>
                          <FormLabel>Official Mail</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your company mail"
                              {...field}
                              className={isNotGmail ? "border-yellow-500" : ""}
                            />
                          </FormControl>
                          {isNotGmail && (
                            <p className="text-sm text-yellow-600">
                              ⚠ Only Gmail addresses ending with @gmail.com are allowed.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  {/* Inquiry Type */}
                  <FormField
                    control={form.control}
                    name="inquiryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inquiry Type</FormLabel>
                        <FormControl>
                          <select
                            className="border rounded px-3 py-2 w-full"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="supplier">Supplier</option>
                            <option value="distributor">Distributor</option>
                            <option value="other">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Other Inquiry Type */}
                  {form.watch("inquiryType") === "other" && (
                    <FormField
                      control={form.control}
                      name="otherInquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify Inquiry Type</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please specify your inquiry type"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {/* Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your partnership proposal..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 transition-colors"
                    disabled={!form.formState.isValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span>Submitting...</span>
                        <div className="animate-spin">⌛</div>
                      </div>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-serif mb-2">Thank You!</h2>
            <div className="text-xl font-medium mb-4">{submittedName} ✨</div>
            <div className="text-gray-600 mb-6">
              Your inquiry has been successfully submitted.<br />
              We'll get back to you soon!
            </div>
            <div className="flex gap-2 text-2xl mb-6">🌟 🎯 💫</div>
            <Button
              onClick={() =>
                window.open(
                  "https://cal.com/emiliocosmetics/15min",
                  "_blank"
                )
              }
              className="bg-accent hover:bg-accent/90 transition-colors m-1"
            >
              Book a Meet
            </Button>
            <Button
              onClick={handleClose}
              className="bg-accent hover:bg-accent/90 transition-colors"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Export CSV utility ---
export function exportInquiriesToCSV() {
  try {
    const inquiriesJSON = localStorage.getItem(CACHE_KEY);
    if (!inquiriesJSON) {
      toast.error("No inquiries found to export.");
      return;
    }
    const inquiries = JSON.parse(inquiriesJSON);
    if (!Array.isArray(inquiries) || inquiries.length === 0) {
      toast.error("No inquiries found to export.");
      return;
    }
    const headers = Object.keys(inquiries[0]);
    const csvRows = [
      headers.join(","),
      ...inquiries.map((inquiry: any) =>
        headers
          .map((header) => {
            let value = inquiry[header] ?? "";
            if (typeof value === "string") {
              value = value.replace(/"/g, '""');
              if (
                value.includes(",") ||
                value.includes('"') ||
                value.includes("\n")
              ) {
                value = `"${value}"`;
              }
            }
            return value;
          })
          .join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partnership_inquiries_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Inquiries exported as CSV!");
  } catch (error) {
    console.error("Error exporting inquiries to CSV:", error);
    toast.error("Failed to export inquiries.");
  }
}
