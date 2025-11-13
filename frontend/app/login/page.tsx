"use client";

import TextField from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 👇 Change URL according to your backend endpoint
            const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error("Invalid email or password");
            }

            const data = await response.json();

            // ✅ Save token to localStorage (or cookies if preferred)
            localStorage.setItem("authToken", data.token);

            console.log("Login successful:", data);

            // Optionally redirect after login
            window.location.href = "/";
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-sm mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Login</h2>

                <TextField
                    label="email"
                    type="text"
                    onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                />

                <TextField
                    label="Password"
                    type="password"
                    onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </Button>
            </form>
        </div>
    );
};

export default LoginPage;
