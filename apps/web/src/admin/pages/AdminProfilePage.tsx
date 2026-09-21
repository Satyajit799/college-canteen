import { useEffect, useState } from "react";
import { getAdminProfile } from "../api/adminProfile";
import type { AdminProfile } from "../api/adminProfile";
import { useAdminAuth } from "../context/AdminAuthContext";

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function AdminProfilePage() {
    const { token } = useAdminAuth();

    const [profile, setProfile] = useState<AdminProfile | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;

        const adminToken = token;
        let cancelled = false;

        async function loadProfile() {
            try {
                setLoading(true);
                setError("");

                const result = await getAdminProfile(adminToken);

                if (!cancelled) {
                    setProfile(result.data);
                }
            } catch (err: unknown) {
                if (cancelled) return;

                console.error("Failed to load admin profile:", err);

                if (
                    typeof err === "object" &&
                    err !== null &&
                    "response" in err
                ) {
                    const error = err as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    };

                    setError(
                        error.response?.data?.message ||
                        "Failed to load profile"
                    );
                } else {
                    setError("Failed to load profile");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen p-8">
                <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                    <p className="text-sm text-slate-500">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-8">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen p-8">
                <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                    <p className="text-sm text-slate-500">
                        Profile not found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Admin Profile
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    View your administrator account information.
                </p>
            </div>

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Profile Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="bg-slate-900 px-6 py-8 sm:px-8">
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            {/* Avatar */}
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-900">
                                {getInitials(profile.name)}
                            </div>

                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-bold text-white">
                                    {profile.name}
                                </h2>

                                <p className="mt-1 text-sm text-slate-300">
                                    {profile.email}
                                </p>

                                <div className="mt-3">
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                        {profile.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="p-6 sm:p-8">
                        <h3 className="mb-5 text-lg font-semibold text-slate-900">
                            Account Information
                        </h3>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <InfoItem
                                label="Full Name"
                                value={profile.name}
                            />

                            <InfoItem
                                label="Email Address"
                                value={profile.email}
                            />

                            <InfoItem
                                label="Role"
                                value={profile.role}
                            />

                            <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Account Status
                                </p>

                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${profile.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {profile.isActive ? "ACTIVE" : "INACTIVE"}
                                </span>
                            </div>

                            <InfoItem
                                label="Account Created"
                                value={formatDate(profile.createdAt)}
                            />

                            <InfoItem
                                label="Last Updated"
                                value={formatDate(profile.updatedAt)}
                            />
                        </div>
                    </div>
                </div>

                {/* Security Information */}
                <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Security
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Your administrator account is protected using
                        authenticated API access. Password information is never
                        displayed here.
                    </p>

                    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">
                            Account ID
                        </p>

                        <p className="mt-1 font-mono text-sm text-slate-500">
                            #{profile.id}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface InfoItemProps {
    label: string;
    value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
    return (
        <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p className="text-sm font-medium text-slate-900">
                {value}
            </p>
        </div>
    );
}