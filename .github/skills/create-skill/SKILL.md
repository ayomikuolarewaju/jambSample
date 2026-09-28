---
name: create-skill
description: "Use when: a multi-step workflow, review checklist, debugging method, or implementation pattern in the conversation should be turned into a reusable VS Code skill. Creates a workspace-scoped SKILL.md with frontmatter, trigger wording, decision logic, and completion checks."
---

# Create a Skill

Use this workflow when the user wants to package a repeatable process into a reusable skill instead of describing it ad hoc each time.

## When to use

Use this skill when any of the following are true:
- The conversation follows a structured workflow or methodology.
- The user is iterating through a process such as debugging, review, implementation, or validation.
- A reusable step-by-step pattern should be preserved for future prompts.
- The goal is to create or refine a `SKILL.md` for a project or personal workflow.

## Decision flow

1. Detect whether the conversation reveals a reusable process.
   - Look for steps, branching decisions, quality gates, and completion criteria.
   - Generalize from the specific example into a reusable workflow.

2. Decide scope.
   - If the workflow is project-specific or team-shared, create a workspace skill in `.github/skills/<skill-name>/SKILL.md`.
   - If the workflow is personal and cross-workspace, create it under the user prompt folder instead.

3. If the process is not yet clear, clarify the missing details.
   - Ask what outcome the skill should produce.
   - Confirm whether the scope is workspace or personal.
   - Decide whether the workflow should be a quick checklist or a full multi-step process.

4. Draft the skill.
   - Add valid YAML frontmatter with a unique skill name and a clear `description`.
   - Use the trigger description to make the skill discoverable.
   - Include a short purpose section, when-to-use guidance, and a decision flow.
   - Document step-by-step actions, branching logic, and validation checkpoints.

5. Validate the result.
   - Confirm the file is in the correct location.
   - Ensure the YAML is syntactically valid.
   - Check that the `description` includes trigger phrases that match likely user requests.
   - Make sure the workflow remains actionable and reusable.

## Output requirements

A strong `SKILL.md` should include:
- A clear skill name and trigger description.
- A concise explanation of purpose and scope.
- A list of situations where the skill is useful.
- Decision points and branching logic.
- A concrete sequence of actions to perform.
- Quality criteria or completion checks.
- Example prompts that show how to invoke it.

## Quality checklist

Before finalizing the skill, confirm all of the following:
- The workflow is general enough to be reused.
- The steps are concrete and ordered logically.
- The decision points are explicit.
- The validation criteria are measurable.
- The skill is discoverable through its description.
- The file is saved in the right customization location.

## Example prompts

- Create a skill for turning debugging workflows into reusable checklists.
- Turn this review process into a project skill for future use.
- Package my implementation workflow into a reusable `SKILL.md`.
- Draft a workspace-scoped skill for multi-step validation and QA.

## Related customizations

If the workflow is broad and applies to many tasks, consider creating an instruction instead of a skill. If the task is single-purpose and parameterized, consider a prompt instead. If the process needs strict isolation or tool restrictions, consider a custom agent.
