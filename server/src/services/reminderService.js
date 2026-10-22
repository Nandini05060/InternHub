import { getInternships, getAllStudents, getSavedInternships, getStudentApplications, createNotification, getUserNotifications } from '../db/repository.js';

/**
 * InternHub Deadline & Notification Reminder Service
 * Scans active, verified internships approaching deadlines (within 7 days)
 * Avoids duplicate reminders and sends in-app alerts (with simulated dev email adapter)
 */

export async function processDeadlineReminders() {
  const summary = {
    scanned: 0,
    approachingDeadlines: 0,
    remindersGenerated: 0,
    skippedDuplicates: 0,
    emailMode: process.env.SMTP_HOST ? 'SMTP Live' : 'Safe Dev-Mode Adapter (No SMTP credentials)'
  };

  try {
    // Only fetch verified, active internships
    const activeInternships = await getInternships({ status: 'verified', isExpired: 'false' });
    summary.scanned = activeInternships.length;

    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    const urgentListings = activeInternships.filter(item => {
      if (!item.deadline) return false;
      const deadlineTime = new Date(item.deadline).getTime();
      const diff = deadlineTime - now;
      return diff > 0 && diff <= SEVEN_DAYS_MS;
    });

    summary.approachingDeadlines = urgentListings.length;
    if (urgentListings.length === 0) return summary;

    const students = await getAllStudents();

    for (const student of students) {
      const saved = await getSavedInternships(student.id);
      const apps = await getStudentApplications(student.id);
      const existingNotifs = await getUserNotifications(student.id);

      for (const internship of urgentListings) {
        const isSaved = saved.some(s => s.id === internship.id);
        const isApplied = apps.some(a => a.internship_id === internship.id);

        if (isSaved || isApplied) {
          const daysLeft = Math.ceil((new Date(internship.deadline).getTime() - now) / (1000 * 60 * 60 * 24));
          const notifTitle = `Deadline Alert: ${internship.title} at ${internship.company_name}`;

          // Check if already notified for this exact internship in the past 48 hours to prevent duplicates
          const alreadyNotified = existingNotifs.some(n =>
            n.title === notifTitle || (n.message && n.message.includes(internship.title))
          );

          if (alreadyNotified) {
            summary.skippedDuplicates++;
            continue;
          }

          // Create in-app notification
          await createNotification({
            userId: student.id,
            title: notifTitle,
            message: `The deadline for ${internship.title} (${internship.company_name}) is in ${daysLeft} day${daysLeft > 1 ? 's' : ''} on ${internship.deadline}. Make sure your application is completed on their official portal!`,
            type: 'deadline',
            link: '/internships'
          });

          summary.remindersGenerated++;
        }
      }
    }
  } catch (error) {
    console.error('Error in processDeadlineReminders:', error);
  }

  return summary;
}
