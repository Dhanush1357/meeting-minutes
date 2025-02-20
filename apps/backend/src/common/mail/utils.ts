import { MoM, Project, User } from "@prisma/client";

export function generateEmailContent(
  mom: MoM,
  project: Project,
  creator: User,
): string {
  const date = new Date(mom.created_at).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Meeting Minutes</h2>
        <p>Dear Team,</p>
        
        <p>Please find attached the minutes of the meeting held on ${date}.</p>
        
        <div style="margin: 20px 0;">
          <strong>Project:</strong> ${project.title}<br>
          <strong>MoM Number:</strong> ${mom.mom_number}<br>
          <strong>Location:</strong> ${mom.place}<br>
        </div>
        
        <p>Please review the attached document and provide any feedback or corrections if needed.</p>
        
        <p style="margin-top: 20px;">Best regards,<br>${creator.first_name}</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    `;
}
