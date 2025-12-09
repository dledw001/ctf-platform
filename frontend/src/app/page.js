// frontend/src/app/page.js
export default function HomePage() {
    return (
        <section>
            <h1 className="text-2xl font-bold mb-2">Mini CTF Platform</h1>
            <p className="mb-4">
                Log in, browse challenges, and submit flags. Admins can manage challenges and view submissions.
            </p>
            <ul className="list-disc ml-6">
                <li>Go to /register to create an account</li>
                <li>Use /login to sign in</li>
                <li>Visit /challenges to see available challenges</li>
                <li>Admin: /admin for dashboard</li>
            </ul>
        </section>
    );
}
