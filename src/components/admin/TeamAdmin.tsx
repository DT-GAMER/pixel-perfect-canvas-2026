import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/site/FormField";
import {
  inviteMember,
  removeMember,
  updateMemberRole,
  type TeamMember,
} from "@/lib/admin/team.functions";
import { formatDate } from "@/lib/format";
import { PageHeader } from "./AdminShell";
import { DeleteButton, adminInput, adminSelect } from "./fields";

export function TeamAdmin({ members, meId }: { members: TeamMember[]; meId: string }) {
  const router = useRouter();
  const updateRole = useServerFn(updateMemberRole);
  const remove = useServerFn(removeMember);

  return (
    <>
      <PageHeader
        title="Team"
        description="Admins manage everything. Editors can only write and publish blog posts."
      />
      <InviteForm />
      <div className="mt-6 overflow-x-auto rounded-md bg-paper">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Team members</caption>
          <thead className="border-b border-light-grey text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Email
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Role
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Added
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-grey">
            {members.map((member) => {
              const me = member.id === meId;
              return (
                <tr key={member.id}>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {member.full_name ?? "—"}{" "}
                    {me && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3">
                    {me ? (
                      <span className="capitalize">{member.role}</span>
                    ) : (
                      <select
                        aria-label={`Role for ${member.email}`}
                        className={`${adminSelect} h-10 w-32`}
                        value={member.role}
                        onChange={async (event) => {
                          try {
                            await updateRole({
                              data: {
                                id: member.id,
                                role: event.target.value as TeamMember["role"],
                              },
                            });
                            toast.success(
                              `${member.email} is now ${event.target.value === "admin" ? "an admin" : "an editor"}`,
                            );
                            await router.invalidate();
                          } catch (error) {
                            toast.error(
                              error instanceof Error ? error.message : "Couldn't change the role",
                            );
                          }
                        }}
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {!me && (
                      <DeleteButton
                        what={`${member.email}'s dashboard access`}
                        onConfirm={async () => {
                          await remove({ data: { id: member.id } });
                          toast.success(`${member.email} removed from the team`);
                          await router.invalidate();
                        }}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function InviteForm() {
  const router = useRouter();
  const invite = useServerFn(inviteMember);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email");
    setError(undefined);
    setBusy(true);
    try {
      const result = await invite({
        data: { email: email.trim(), fullName: fullName.trim(), role },
      });
      toast.success(
        result.emailed
          ? `Invitation sent to ${email.trim()}`
          : `${email.trim()} added, but the invitation email failed. They can sign in at /admin/login.`,
      );
      setEmail("");
      setFullName("");
      await router.invalidate();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Couldn't send the invitation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-md bg-paper p-5"
      aria-labelledby="invite-title"
    >
      <h2 id="invite-title" className="font-display text-lg font-bold text-deep-blue">
        Invite someone
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
        <Field label="Email" htmlFor="invite-email" error={error}>
          <Input
            id="invite-email"
            type="email"
            autoComplete="off"
            className={adminInput}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={!!error}
          />
        </Field>
        <Field label="Name (optional)" htmlFor="invite-name" error={undefined}>
          <Input
            id="invite-name"
            className={adminInput}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </Field>
        <Field label="Role" htmlFor="invite-role" error={undefined}>
          <select
            id="invite-role"
            className={adminSelect}
            value={role}
            onChange={(event) => setRole(event.target.value as "admin" | "editor")}
          >
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Button type="submit" disabled={busy} className="h-12 rounded-full px-6">
          {busy ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <UserPlus aria-hidden="true" />
          )}{" "}
          Send invite
        </Button>
      </div>
    </form>
  );
}
