// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = document.getElementById("registerName").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        const message = document.getElementById("registerMessage");

        message.textContent = data.message;

        if (response.ok) {

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        }
    });
}


// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        const message = document.getElementById("loginMessage");

        message.textContent = data.message;

        if (response.ok) {

            loginForm.reset();

            setTimeout(() => {
                window.location.href = "profile.html";
            }, 1000);
        }
    });
}
// FORGOT PASSWORD
const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("forgotEmail").value;

        const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email
            })
        });

        const data = await response.json();

        document.getElementById("forgotMessage").textContent =
            data.message;
    });
}


// RESET PASSWORD
const resetPasswordForm =
    document.getElementById("resetPasswordForm");

if (resetPasswordForm) {

    resetPasswordForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {

            document.getElementById("resetMessage").textContent =
                "Passwords do not match.";

            return;
        }

        const params = new URLSearchParams(window.location.search);

        const token = params.get("token");

        if (!token) {

            document.getElementById("resetMessage").textContent =
                "Invalid reset link.";

            return;
        }

        const response = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token,
                password: newPassword
            })
        });

        const data = await response.json();

        document.getElementById("resetMessage").textContent =
            data.message;

        if (response.ok) {

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    });
}