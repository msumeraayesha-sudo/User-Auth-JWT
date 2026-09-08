async function loadProfile() {

    const response = await fetch("/api/profile", {
        credentials: "include"
    });

    const data = await response.json();

    const profile = document.getElementById("profile");

    if (!response.ok) {

        profile.innerHTML = `
            <p>${data.message}</p>
            <p>
                <a href="login.html">Sign In</a>
            </p>
        `;

        return;
    }

    profile.innerHTML = `
        <p><strong>Name:</strong> ${data.user.name}</p>
        <p><strong>Email:</strong> ${data.user.email}</p>
        <p><strong>User ID:</strong> ${data.user.id}</p>
    `;
}


document
    .getElementById("logoutButton")
    .addEventListener("click", async () => {

        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        window.location.href = "login.html";
    });


loadProfile();