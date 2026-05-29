# Candidate Creation with Email Notification Feature

## Overview
When a new candidate account is created in SIPMS, an automated welcome email is sent to the candidate's email address containing:
- **Account Credentials**: Email and temporary password
- **48-Hour Quiz Deadline Notice**: Prominent warning that quizzes must be completed within 48 hours
- **Login Instructions**: Direct link and next steps
- **Security Notice**: Reminder to change password on first login

## How It Works

### 1. Creating a New Candidate
An administrator can create a candidate account via:
- **Admin Dashboard**: Users > Create New User → Select ROLE_CANDIDATE
- **API Endpoint**: POST `/api/users` with `roles: ["ROLE_CANDIDATE"]`

**Example Request:**
```json
POST http://localhost:8080/api/users

{
  "firstName": "Ayadi",
  "lastName": "Candidate",
  "email": "ayadi9732@gmail.com",
  "phone": "+216 92 123 456",
  "specialty": "Software Development",
  "internshipYear": 2,
  "roles": ["ROLE_CANDIDATE"]
}
```

### 2. Automatic Email Sending
When the candidate is created:
- A **temporary password** is auto-generated
- An HTML email is automatically sent to the candidate's email address
- The email includes a special banner: **"Your technical assessment quiz will be available for 48 hours only"**

### 3. Email Content Structure

The candidate receives an email with:

#### Header
- SIPMS branding and logo
- Welcome message

#### Main Content
- **Login Credentials** (Email & Password)
- **Login URL**: Direct link to access the portal
- **48-Hour Quiz Deadline** (highlighted in orange):
  - Prominent warning box
  - Statement: "Your technical assessment quiz will be available for 48 hours only"
  - Call-to-action: "Please log in and complete it as soon as possible"

#### Next Steps Section
1. Log in to the portal using provided credentials
2. Complete your profile information
3. **Take the technical assessment quiz within 48 hours** ⏰
4. Upload your CV
5. Wait for evaluation results

#### Security Notice
- Warning to change password after first login
- Instruction not to share credentials

## Email Template Details

### For Staff (Admin, Manager, Receptionist)
- Standard welcome email
- No quiz deadline notice

### For Candidates ⭐ (NEW)
- **Special candidate welcome template**
- **48-Hour Quiz Deadline Notice** (prominent orange warning box)
- Emphasis on completing quiz quickly
- Next steps tailored for candidates

## Code Changes

### 1. EmailService.java
**New Method**: `sendCandidateWelcomeEmail()`
```java
@Async
public void sendCandidateWelcomeEmail(String to, String name, String tempPassword, String loginUrl) {
    // Sends special candidate welcome email with 48-hour quiz deadline
}
```

**New HTML Builder**: `buildCandidateWelcomeEmailHtml()`
- Creates rich HTML email with:
  - SIPMS gradient header
  - Credentials display
  - **48-hour countdown notice in orange**
  - Next steps checklist
  - Security warnings

### 2. UserService.java
**Modified**: `createUser()` method
```java
// Check if user has ROLE_CANDIDATE
boolean isCandidate = roles.stream()
    .anyMatch(role -> "ROLE_CANDIDATE".equals(role.getName()));

if (isCandidate) {
    // Send CANDIDATE welcome email with quiz deadline
    emailService.sendCandidateWelcomeEmail(...);
} else {
    // Send standard welcome email for staff
    emailService.sendWelcomeEmail(...);
}
```

## Testing the Feature

### 1. Run Test Script
```bash
cd C:\SIPMS
node test-candidate-creation.js
```

### 2. Manual Testing
1. Go to Admin Dashboard → Users
2. Create a new user with:
   - Role: **CANDIDATE**
   - Email: Your test email
3. The system automatically:
   - Generates a temporary password
   - Sends welcome email with 48-hour notice

### 3. Email Verification
Check your email inbox for:
- ✓ Subject: "Welcome to SIPMS — Your Account & Quiz Information"
- ✓ Credentials section with password
- ✓ Orange warning box: "⏰ Important: Quiz Deadline"
- ✓ Message: "Your technical assessment quiz will be available for 48 hours only"
- ✓ Next steps checklist

## Configuration

### Email Settings (application-prod.properties)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=ayadi9732@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Email service
app.email.from=ayadi9732@gmail.com
app.email.enabled=true
```

### Login URL
- **Frontend**: `http://localhost:5173/login`
- **Backend**: Configured in `UserService.createUser()`
- Edit if hosting on different domain

## Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| Auto Email on Candidate Creation | ✅ | Sent automatically when creating ROLE_CANDIDATE |
| Temporary Password Generation | ✅ | Auto-generated secure password |
| 48-Hour Quiz Deadline Notice | ✅ | Prominent orange banner in email |
| Candidate Welcome Template | ✅ | Special HTML template for candidates |
| Login Instructions | ✅ | Direct URL and step-by-step guide |
| Security Warnings | ✅ | Password change reminder |
| Next Steps Checklist | ✅ | Clear numbered steps for candidates |
| Non-Blocking Email | ✅ | Doesn't delay candidate creation if email fails |

## Troubleshooting

### Emails Not Sending
1. Check email configuration in `application-prod.properties`
2. Verify Gmail app password is correct
3. Check server logs for email errors
4. Verify email service is enabled: `app.email.enabled=true`

### Wrong Email Template
- Ensure role is set to **ROLE_CANDIDATE** (not just "CANDIDATE")
- Check that email service is calling `sendCandidateWelcomeEmail()`
- Staff roles should receive standard `sendWelcomeEmail()`

### 48-Hour Notice Not Showing
- Verify HTML email rendering (some email clients may hide HTML)
- Check that `buildCandidateWelcomeEmailHtml()` is being called
- HTML should include: "Your technical assessment quiz will be available for 48 hours only"

## Future Enhancements

Potential improvements:
- Email reminders at 24-hour mark for uncompleted quizzes
- Email at 1-hour mark before quiz expires
- Configurable quiz deadline (currently hardcoded to 48 hours)
- SMS notifications as alternative to email
- Candidate portal notification banner
- Quiz countdown timer in dashboard

---

**Last Updated**: May 21, 2026
**Feature Status**: ✅ Production Ready
**Testing**: ✅ Verified Working
