import { z } from "zod";

export const professions = [
  "Doctor/Clinician",
  "Nurse",
  "Pharmacist",
  "Researcher",
  "Engineer/Developer",
  "Designer",
  "Data/AI Specialist",
  "Founder/Executive",
  "Student",
  "Investor",
  "Other",
] as const;

export const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "Rwanda",
  "United Kingdom",
  "United States",
  "Canada",
  "Other",
] as const;

export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100, "Name must be 100 characters or fewer"),
    email: z.string().trim().email("Enter a valid email address").max(255, "Email must be 255 characters or fewer"),
    profession: z.enum(professions, { errorMap: () => ({ message: "Choose your profession" }) }),
    otherProfession: z.string().trim().max(80, "Profession must be 80 characters or fewer").optional(),
    country: z.string().trim().min(2, "Choose your country").max(80, "Country must be 80 characters or fewer"),
    city: z.string().trim().min(2, "Enter your city").max(80, "City must be 80 characters or fewer"),
    privacyAgreed: z.literal(true, { errorMap: () => ({ message: "Please agree to the privacy policy" }) }),
    subscribeUpdates: z.boolean().default(false),
    website: z.string().max(0).default(""),
  })
  .superRefine((data, context) => {
    if (data.profession === "Other" && (!data.otherProfession || data.otherProfession.length < 2)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["otherProfession"], message: "Tell us your profession" });
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
