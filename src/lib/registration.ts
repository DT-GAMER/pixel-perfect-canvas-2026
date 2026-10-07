import { z } from "zod";
import { countries } from "./countries";

export { countries };

// Grouped for the registration dropdown. Values are stored as-is and must match
// the registrations_profession_check constraint (see supabase/migrations).
export const professionGroups = [
  {
    label: "Tech",
    options: [
      "Software Engineer/Developer",
      "Product Manager",
      "Product/UX Designer",
      "Data/AI Specialist",
      "Cloud/DevOps Engineer",
      "Cybersecurity Specialist",
      "IT/Systems Professional",
    ],
  },
  {
    label: "Marketing & sales",
    options: ["Marketing/Growth", "Content/Communications", "Sales/Business Development"],
  },
  {
    label: "Leadership & business",
    options: ["Founder/Co-founder", "CEO/Executive", "Manager/Team Lead", "Investor"],
  },
  { label: "Other", options: ["Student", "Other"] },
] as const;

export const professions = professionGroups.flatMap((group) => group.options) as [
  (typeof professionGroups)[number]["options"][number],
  ...(typeof professionGroups)[number]["options"][number][],
];

export const registrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(100, "Name must be 100 characters or fewer"),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(255, "Email must be 255 characters or fewer"),
    profession: z.enum(professions, { errorMap: () => ({ message: "Choose your profession" }) }),
    otherProfession: z
      .string()
      .trim()
      .max(80, "Profession must be 80 characters or fewer")
      .optional(),
    country: z.enum(countries, { errorMap: () => ({ message: "Choose your country" }) }),
    city: z
      .string()
      .trim()
      .min(2, "Enter your city")
      .max(80, "City must be 80 characters or fewer"),
    privacyAgreed: z.boolean().refine((value) => value, "Please agree to the privacy policy"),
    subscribeUpdates: z.boolean(),
    website: z.string().max(0),
    // Blog path to return to after signing in, when registering from a sign-up wall.
    next: z.string().max(300).optional(),
  })
  .superRefine((data, context) => {
    if (data.profession === "Other" && (!data.otherProfession || data.otherProfession.length < 2)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherProfession"],
        message: "Tell us your profession",
      });
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
