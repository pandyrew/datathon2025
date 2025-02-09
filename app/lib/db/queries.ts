import { getConnection } from "./drizzle";
import {
  applications,
  participantDetails,
  judgeDetails,
  mentorDetails,
  users,
  teams,
  ratings,
} from "./schema";
import { eq, sql, desc } from "drizzle-orm";
import { ApplicationRole, Application } from "@/app/types/application";

export async function getApplicationByUserId(
  userId: string,
  role: ApplicationRole
) {
  const db = await getConnection();

  const [application] = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .where(eq(applications.role, role))
    .limit(1);

  if (!application) return null;

  let details = null;
  if (role === "participant") {
    [details] = await db
      .select()
      .from(participantDetails)
      .where(eq(participantDetails.applicationId, application.id));
  } else if (role === "judge") {
    [details] = await db
      .select()
      .from(judgeDetails)
      .where(eq(judgeDetails.applicationId, application.id));
  } else if (role === "mentor") {
    [details] = await db
      .select()
      .from(mentorDetails)
      .where(eq(mentorDetails.applicationId, application.id));
  }

  return {
    ...application,
    details,
  };
}

export async function updateApplication(
  applicationId: string,
  role: ApplicationRole,
  data: Partial<Application>
) {
  const db = await getConnection();

  // Update base application data
  const [updatedApplication] = await db
    .update(applications)
    .set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(applications.id, applicationId))
    .returning();

  // Update role-specific details
  if (role === "participant" && data.details) {
    await db
      .update(participantDetails)
      .set(data.details)
      .where(eq(participantDetails.applicationId, applicationId));
  } else if (role === "judge" && data.details) {
    await db
      .update(judgeDetails)
      .set(data.details)
      .where(eq(judgeDetails.applicationId, applicationId));
  } else if (role === "mentor" && data.details) {
    await db
      .update(mentorDetails)
      .set(data.details)
      .where(eq(mentorDetails.applicationId, applicationId));
  }

  return getApplicationByUserId(updatedApplication.userId, role);
}

export async function getAllApplications(role: ApplicationRole) {
  const db = await getConnection();

  const allApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.role, role));

  const applicationIds = allApplications.map((app) => app.id);

  let details;
  if (role === "participant") {
    details = await db
      .select()
      .from(participantDetails)
      .where(sql`application_id = ANY(${applicationIds})`);
  } else if (role === "judge") {
    details = await db
      .select()
      .from(judgeDetails)
      .where(sql`application_id = ANY(${applicationIds})`);
  } else if (role === "mentor") {
    details = await db
      .select()
      .from(mentorDetails)
      .where(sql`application_id = ANY(${applicationIds})`);
  }

  const detailsMap = new Map(details?.map((d) => [d.applicationId, d]));

  return allApplications.map((app) => ({
    ...app,
    details: detailsMap.get(app.id) || null,
  }));
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "draft" | "submitted" | "accepted" | "rejected"
) {
  const db = await getConnection();

  const [updatedApplication] = await db
    .update(applications)
    .set({
      status,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(applications.id, applicationId))
    .returning();

  return updatedApplication;
}

export async function testConnection() {
  try {
    const db = await getConnection();
    const result = await db.select().from(users).limit(1);
    console.log("Database connection successful:", result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

export async function createUser(data: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const db = await getConnection();

  const [user] = await db
    .insert(users)
    .values({
      ...data,
    })
    .returning();

  return { user };
}

export async function getUserWithDetails(userId: string) {
  const db = await getConnection();

  // Get the user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  if (!user) return null;

  // Get all applications for this user
  const userApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, user.id));

  // Get details for each application
  const enrichedApplications = await Promise.all(
    userApplications.map(async (app) => {
      let details = null;
      if (app.role === "participant") {
        [details] = await db
          .select()
          .from(participantDetails)
          .where(eq(participantDetails.applicationId, app.id));
      } else if (app.role === "judge") {
        [details] = await db
          .select()
          .from(judgeDetails)
          .where(eq(judgeDetails.applicationId, app.id));
      } else if (app.role === "mentor") {
        [details] = await db
          .select()
          .from(mentorDetails)
          .where(eq(mentorDetails.applicationId, app.id));
      }

      return {
        ...app,
        details,
      };
    })
  );

  return {
    ...user,
    applications: enrichedApplications,
  };
}

export async function deleteApplications(userId: string) {
  const db = await getConnection();

  const userApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId));

  for (const app of userApplications) {
    if (app.role === "participant") {
      await db
        .delete(participantDetails)
        .where(eq(participantDetails.applicationId, app.id));
    } else if (app.role === "judge") {
      await db
        .delete(judgeDetails)
        .where(eq(judgeDetails.applicationId, app.id));
    } else if (app.role === "mentor") {
      await db
        .delete(mentorDetails)
        .where(eq(mentorDetails.applicationId, app.id));
    }
  }

  await db.delete(applications).where(eq(applications.userId, userId));
}

export async function getApplicationStats() {
  const db = await getConnection();

  const allApplications = await db.select().from(applications);

  const stats = {
    total: allApplications.length,
    participant: {
      total: 0,
      submitted: 0,
      accepted: 0,
      rejected: 0,
    },
    mentor: {
      total: 0,
      submitted: 0,
      accepted: 0,
      rejected: 0,
    },
    judge: {
      total: 0,
      submitted: 0,
      accepted: 0,
      rejected: 0,
    },
  };

  allApplications.forEach((app) => {
    stats[app.role].total++;
    if (app.status === "submitted") stats[app.role].submitted++;
    if (app.status === "accepted") stats[app.role].accepted++;
    if (app.status === "rejected") stats[app.role].rejected++;
  });

  return stats;
}

export async function addRating(data: {
  applicationId: string;
  score: number;
  feedback?: string;
  ratedBy: string;
}) {
  const db = await getConnection();

  const [rating] = await db.insert(ratings).values(data).returning();

  return rating;
}

export async function getRating(applicationId: string) {
  const db = await getConnection();

  const [rating] = await db
    .select()
    .from(ratings)
    .where(eq(ratings.applicationId, applicationId))
    .limit(1);

  return rating || null;
}

export async function getAllRatings(applicationId: string) {
  const db = await getConnection();

  return db
    .select()
    .from(ratings)
    .where(eq(ratings.applicationId, applicationId))
    .orderBy(desc(ratings.createdAt));
}

export async function deleteRating(ratingId: string) {
  const db = await getConnection();
  await db.delete(ratings).where(eq(ratings.id, ratingId));
}

export async function updateRating(
  ratingId: string,
  data: {
    score: number;
    feedback?: string;
  }
) {
  const db = await getConnection();

  const [rating] = await db
    .update(ratings)
    .set(data)
    .where(eq(ratings.id, ratingId))
    .returning();

  return rating;
}
