import { z } from "zod";

export const timelineOptions = z.object({
  filters: z
    .object({
      author: z.object({
        is: z
          .object({
            id: z.string(),
          })
          .optional(),
        isNot: z
          .object({
            id: z.string(),
          })
          .optional(),
        //add programming languages, etc
      }),
    })
    .optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().min(5).max(50).default(5),
});

export type TimelineOptions = z.infer<typeof timelineOptions>;
