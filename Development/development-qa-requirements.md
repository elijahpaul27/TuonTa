Development/QA Requirements Specification
1. User Session & Navigation
1.1 Session Persistence Behavior
Implement two distinct behaviors for page refresh versus leaving and re-entering the application.

Page Refresh
A browser refresh must not be treated as a new session. The user's current activity and temporary state must be preserved, including:

Current page/section
Exam/practice progress
Answers already entered
Score/results
AI-generated analysis
Other relevant temporary activity
Exit and Re-entry
When the user exits the application and returns after a period of time, the user should be returned to the Login page rather than automatically restoring their previous activity.

Requirements
Browser refresh must not create a new session.
Session expiration must be handled separately from ordinary page refreshes.
Temporary application state should survive page refreshes where appropriate.
Expired sessions must require the user to log in again.
1.2 Collapsible Menu Behavior
Whenever the user selects a page or section from the collapsible menu:

Automatically collapse the menu after successful navigation.
Immediately display the selected page/section as the active view.
Apply the behavior consistently throughout the application.
1.3 Engagement Content
Add rotating/randomized content throughout appropriate areas of the application.

Content types should include:

Comforting words — Short messages that reassure users after mistakes or difficult activities.
Study hacks — Practical and actionable study techniques.
Motivational quotes — Unique, witty, encouraging, and morale-boosting rather than generic motivational statements.
Requirements
Content should be randomly selected.
The same message should not repeatedly appear to the user unnecessarily.
Content should be appropriate to the user's current activity or context where possible.
2. Mistake Notebook
2.1 Add Clear Instructions to Every Question
Every question in the Mistake Notebook must contain sufficient context and instructions for the user to understand exactly what is being tested.

Current Issue
Topic: Idiomatic Expressions

She was _______ to finish the assignment.

Your Answer:
B. burned up

Correct Answer:
C. burning for

The supposed correct answer does not naturally fit the sentence, making the question potentially invalid.

Required Improvement
Before a question can be recorded or published, validate:

Grammar
Sentence structure
Context
Correctness of the answer
Plausibility of distractors
Whether the question actually tests the intended concept
The system must reject questions where the supposedly correct answer produces an ungrammatical, unnatural, or logically incorrect sentence.

2.2 Prevent Redundant or Poorly Structured Questions
Questions must be grammatically and logically complete.

Current Issue
He likes reading, ____ to watch movies, and to play basketball.

If the correct answer is to, the resulting sentence becomes:

He likes reading, to to watch movies, and to play basketball.

This makes the answer invalid.

Required Improvement
Add question validation before a question can be recorded or published.

The validation should detect:

Duplicate words created by inserting an answer
Incorrect grammar
Missing words
Redundant words
Inconsistent parallel structure
Incorrect answer keys
Distractors that are also grammatically valid
Ambiguous questions
Question Quality Gate
A question should not be accepted into the question bank unless:

The question is grammatically valid.
The intended answer produces a natural and correct result.
The answer key matches the intended correct answer.
Distractors are plausible but incorrect.
The question unambiguously tests the intended concept.
Inserting the answer does not create duplicate or redundant words.
The complete resulting sentence or problem is logically coherent.
3. Mistake Notebook Explanations
3.1 Improve Explanation Quality
Explanations must be complete, instructional, and understandable.

Current Behavior
20% of ₱500 = 0.20 × 500 = ₱100.

Required Behavior
Explanations should teach the concept rather than simply reveal the answer.

For calculation-based questions, explanations should generally follow this structure:

Identify what the question is asking.
Identify the relevant formula or concept.
Substitute the given values.
Perform the calculation.
State the final answer.
Briefly explain why the user's answer was incorrect, when applicable.
The explanation should be adapted to the question type. For language, reading, grammar, and other non-mathematical questions, the same instructional principle should apply without forcing a mathematical format.

3.2 AI Assistance
Keep the existing Ask AI Tutor button.

Add suggested prompts underneath it:

Explain the formula
Explain why my answer is wrong
Give me another example
Give me a similar practice question
Teach me the concept step-by-step
Give me a quick way to remember this
Suggested Prompt Behavior
Each suggested prompt should automatically send an appropriate, contextualized request to the AI Tutor.

The prompt should include the necessary question context so that the AI can provide a useful explanation without requiring the user to restate the question.

4. Consolidate Repeated Mistakes
The Mistake Notebook must not display the same question repeatedly every time the user answers it incorrectly.

Current Behavior
The same question may appear multiple times:

Attempted Sep 12, 2026
Ask AI Tutor

and:

Attempted Sep 11, 2026
Ask AI Tutor

Required Behavior
Display one consolidated question card for the question.

At the top of the card, display an appropriate notice.

For example:

⚠️ You have answered this question incorrectly 2 times.

After five incorrect attempts:

⚠️ You have answered this question incorrectly 5 times.

Attempt History
The system must maintain the complete attempt history internally while the UI focuses on the consolidated mistake.

The card may optionally display:

Number of incorrect attempts
Most recent attempt
First attempt
Improvement/status
View attempt history
Data Requirements
Mistake records should be associated with a stable question identifier so that multiple incorrect attempts against the same question can be grouped together.

The question itself must never be duplicated simply because it was answered incorrectly multiple times.

5. Study Hall Recommendation
Dedicate a section of the Mistake Notebook specifically to remediation.

Suggested Section
📚 Need a Quick Review?
You seem to be having difficulty with some of these topics. Visit Study Hall for a crash course and review the concepts before trying again.

Provide dynamically generated buttons based on the user's mistakes.

Examples:

Review Idiomatic Expressions
Review Critical Reading
Review Percentages
Review Grammar
Review other relevant topics
Requirements
Recommendations must be generated from the user's recorded mistakes.
Recommendations should prioritize topics with repeated or recent mistakes where appropriate.
Each button must redirect to the corresponding Study Hall topic/subtopic.
If multiple mistakes belong to the same topic, show a single relevant recommendation rather than unnecessary duplicates.
6. AI Tutor Chat Restrictions
The AI Tutor opened from the Mistake Notebook must be strictly scoped to the selected mistake.

For example, if the selected question is:

What is the primary purpose of identifying an author's tone?

The AI Tutor may answer questions related to:

The exact question
The concept being tested
Why the user's answer was wrong
Why the correct answer is correct
Related examples
Study techniques for the concept
Similar practice questions
Relevant terminology
Relevant formulas or concepts
Off-Topic Behavior
The Mistake Notebook AI Tutor must not become a general-purpose chatbot.

If the user asks an unrelated question such as:

Who is the president of the Philippines?

The tutor should respond with an appropriate scope restriction, such as:

I'm your tutor for this specific question, so I can only help with topics related to this question and the concept it tests. I can explain the concept, give you examples, or suggest techniques for solving similar questions.

Scope Requirements
The AI Tutor should:

Receive the selected mistake/question as context.
Receive the relevant concept/topic/subtopic.
Understand the user's original answer.
Understand the correct answer.
Restrict responses to the educational scope of the selected mistake.
Reject unrelated general-knowledge requests.
Avoid behaving as a general-purpose conversational assistant.
7. AI Study Guide
7.1 Recommended Next Steps Must Be Functional
Every button displayed in Recommended Next Steps must have an actual purpose.

For example:

Idiomatic Expressions
The button must either:

Redirect to the relevant Study Hall lesson.
Open an appropriate educational resource.
Trigger another meaningful in-app action.
If external resources are used, they must be relevant and educational, such as an appropriate Oxford International English resource for idiomatic expressions.

Review Mistake Notebook
Add:

📓 Review Mistake Notebook

This button must redirect directly to the user's Mistake Notebook.

No Dead Buttons
No dead buttons are permitted.

If a recommendation cannot be connected to a meaningful destination or action:

Remove the button.
Do not display a non-functional recommendation.
7.2 Persist AI-Generated Analysis
Once AI Study Guide analysis has been successfully generated, it must be persisted.

Current Problem
Current flow:

User completes Practice Weak Areas / Mock Exam.
Results are generated.
Score Breakdown appears.
User opens AI Study Guide.
AI analysis is generated.
User returns to Score Breakdown.
User opens AI Study Guide again.
Previously generated analysis disappears.
UI displays Retry AI Analysis again.
Required Behavior
Once successfully generated:

AI Analysis Available

The analysis must remain available when navigating between:

Score Breakdown
AI Study Guide
Other result-related sections
Returning to AI Study Guide must display the previously generated analysis instead of restarting the generation process.

Retry Behavior
Display:

Retry AI Analysis

only when:

AI generation genuinely failed, or
No analysis exists yet.
Once generation succeeds, replace the retry state with the saved analysis.

Persistence Requirements
The generated analysis must:

Be persisted beyond component/page navigation.
Be associated with the specific exam/practice attempt.
Not be overwritten by analysis from another attempt.
Remain available when the user navigates away and returns.
Be restored when the relevant result/attempt is reopened.
Each exam/practice attempt should have its own AI analysis record.

8. Admin Dashboard
8.1 Replace the Collapsible Admin Menu
The Admin Dashboard should have a dedicated top navigation bar.

Remove the current collapsible menu containing user-facing menu items.

Top Navbar
The navbar should remain visible and accessible across all admin pages:

QA Dashboard
Question Bank
User Management
Profile / Logout
Example:

Admin Portal
QA Dashboard | Question Bank | User Management | Profile / Logout

Requirements
Admin navigation must remain persistent across admin pages.
The admin interface must be clearly separated from the normal user interface.
User-facing navigation should not appear as the primary navigation inside the Admin Portal.
Admin users should be able to move between admin pages without reopening a collapsible menu.
9. Question Bank Management
The Question Bank currently allows access to questions but does not provide sufficient management controls.

Add:

Edit
Manage Status
Status Management
Since Rejected functions as a soft delete, a permanent Delete button is not necessarily required.

Supported status transitions should include:

Verified → Rejected
Rejected → Verified
Pending → Verified
Pending → Rejected
Status changes should follow the established QA workflow and permissions.

Purpose
This allows an accidentally verified AI-generated question to be corrected without permanently deleting its record.

10. Edit Question
The Edit button should open a floating modal/pane.

The edit form should use the same general structure as Add New Question.

Edit Question Fields
The form should support existing question data including:

Question type
Topic
Subtopic
Question/instruction
Choices
Correct answer
Explanation
Difficulty
Other existing question metadata
Form Behavior
Existing values must automatically populate the form.

Actions
Provide:

Save Changes
Cancel
The administrator must be able to correct an AI-generated question that was accidentally verified.

Validation
Edited questions must pass the same question-quality validation rules used for newly created questions before they can be saved/published.

11. Recommended Implementation Priorities
🔴 Critical
Fix invalid and grammatically incorrect questions.
Consolidate repeated Mistake Notebook entries.
Persist AI Study Guide analysis.
Correct refresh versus session-expiration behavior.
Make all navigation and recommendation buttons functional.
Add Question Bank Edit and Manage Status functionality.
🟠 High Priority
Improve Mistake Notebook explanations.
Add AI Tutor scope restrictions.
Add Study Hall recommendations to the Mistake Notebook.
Replace the admin collapsible menu with a persistent top navbar.
🟢 Enhancement
Add suggested AI Tutor prompts.
Add random comforting messages.
Add random study hacks.
Add random morale-boosting/witty quotes.
12. QA Acceptance Criteria
The following acceptance criteria should be used during development and QA testing.

Session & Navigation
 Browser refresh does not create a new session.
 Current page/section survives browser refresh.
 Exam/practice progress survives browser refresh.
 Entered answers survive browser refresh.
 Scores/results survive browser refresh.
 Generated AI analysis survives browser refresh/navigation.
 Expired sessions redirect to Login.
 Session expiration is handled independently of browser refresh.
 Collapsible menus automatically close after successful navigation.
 Selected navigation item immediately becomes the active view.
 Navigation behavior is consistent throughout the application.
Question Quality
 Every question has clear instructions/context.
 Grammar validation is performed before recording/publishing.
 Sentence structure is validated.
 Correct answers are validated.
 Distractors are validated for plausibility.
 Duplicate words are detected.
 Redundant words are detected.
 Missing words are detected.
 Parallel-structure issues are detected.
 Incorrect answer keys are detected.
 Ambiguous questions are detected.
 Questions testing the wrong concept are rejected.
 Edited questions are revalidated before saving.
Mistake Notebook
 The same question is consolidated into one card.
 Incorrect attempt counts are tracked.
 Attempt history is retained internally.
 The UI displays the current incorrect-attempt count.
 Study Hall recommendations are generated from mistakes.
 Recommendation buttons redirect to valid Study Hall topics.
 Explanations teach the underlying concept.
 Explanations explain incorrect user answers when appropriate.
 Ask AI Tutor remains available.
 Suggested AI Tutor prompts work correctly.
AI Tutor
 Tutor receives the selected mistake as context.
 Tutor understands the relevant concept.
 Tutor can explain the user's mistake.
 Tutor can explain the correct answer.
 Tutor can provide related examples.
 Tutor can generate similar practice questions.
 Tutor can provide study techniques for the concept.
 Tutor rejects unrelated questions.
 Tutor does not behave as a general-purpose chatbot.
AI Study Guide
 Every Recommended Next Steps button performs a meaningful action.
 Dead buttons are removed.
 Mistake Notebook recommendation navigates correctly.
 Study Hall recommendations navigate correctly.
 AI analysis is saved after successful generation.
 Saved analysis remains available after navigation.
 Analysis is associated with the correct exam/practice attempt.
 Different attempts do not overwrite each other's analysis.
 Retry AI Analysis appears only when appropriate.
 Successful analysis replaces the retry state.
Admin Dashboard
 Admin pages use the dedicated top navbar.
 User-facing collapsible navigation is removed from the Admin Portal.
 Admin navbar is accessible on all admin pages.
 QA Dashboard navigation works.
 Question Bank navigation works.
 User Management navigation works.
 Profile/Logout functionality works.
 Question Bank supports Edit.
 Question Bank supports status management.
 Verified questions can be rejected when appropriate.
 Rejected questions can be restored to Verified when appropriate.
 Pending questions can be Verified or Rejected according to workflow.
 Edit modal/pane opens correctly.
 Existing question values populate automatically.
 Save Changes works.
 Cancel works.
 Edited questions pass validation before being saved.
13. Overall Acceptance Principle
The application should follow one simple rule:

Every question must be valid, every explanation must teach, every button must do something meaningful, every generated result must persist when the user navigates away and comes back, and user/admin experiences must remain clearly separated.

This principle should guide both development decisions and final QA acceptance.