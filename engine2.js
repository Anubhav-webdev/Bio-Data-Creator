// ========================
// Initial Setup
// ========================
window.addEventListener("DOMContentLoaded", () => {
     cvRestoreFormData();
     if (localStorage.getItem("cvForm")) generateCV();
     cvAddAutoSaveListeners();
});


// ========================
// Form Validation
// ========================
function cvValidateForm() {
     const requiredFields = [
          { id: "cvName", label: "Name" },
          { id: "cvPhone", label: "Phone" },
          { id: "cvEmail", label: "Email" },
          { id: "cvLinkedIn", label: "LinkedIn" },
     ];

     for (let field of requiredFields) {
          const el = document.getElementById(field.id);
          const value = el ? el.value.trim() : "";

          const prevError = document.getElementById(field.id + "-error");
          if (prevError) prevError.remove();

          if (!value) {
               const error = document.createElement("span");
               error.id = field.id + "-error";
               error.style.color = "red";
               error.style.fontSize = "0.9em";
               error.textContent = `Please fill out the ${field.label} field.`;
               el.parentElement.appendChild(error);
               el.focus();
               return false;
          }
     }

     const cvName = document.getElementById("cvName").value.trim();
     if (cvName.length < 3) {
          alert("Name must be at least 3 characters long.");
          return false;
     }


     // Profile picture check
     const cvProfilePicPreview = document.getElementById("cvProfilePicPreview");
     const cvProfilePicInput = document.getElementById("cvProfilePic"); // Declare it here

     if (
          !cvProfilePicPreview ||
          !cvProfilePicPreview.src ||
          cvProfilePicPreview.naturalWidth === 0 ||
          cvProfilePicPreview.style.display === "none"
     ) {
          alert("Please upload your Profile Picture.");
          if (cvProfilePicInput) cvProfilePicInput.focus(); // Now this is defined
          return false;
     }


     const cvPhone = document.getElementById("cvPhone").value.trim();
     if (!/^[0-9]{10}$/.test(cvPhone)) {
          alert("Please enter a valid 10-digit phone number.");
          return false;
     }

     const cvEmail = document.getElementById("cvEmail").value.trim();
     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailPattern.test(cvEmail)) {
          alert("Please enter a valid email address.");
          return false;
     }

     const cvLinkedIn = document.getElementById("cvLinkedIn").value.trim();
     if (!cvLinkedIn) {
          alert("Please enter your LinkedIn profile link.");
          return false;
     }

     return true;
}


// ========================
// Local Storage Functions
// ========================
function cvSaveFormDataLocally() {
     const data = {
          cvName: document.getElementById("cvName").value,
          cvPhone: document.getElementById("cvPhone").value,
          cvEmail: document.getElementById("cvEmail").value,
          cvLinkedIn: document.getElementById("cvLinkedIn").value,
          cvObjective: document.getElementById("cvObjective").value,
          cvSkills: document.getElementById("cvSkills").value,
          cvAchievements: document.getElementById("cvAchievements").value,
          cvLanguages: document.getElementById("cvLanguages").value,
          cvHobbies: document.getElementById("cvHobbies").value,
          cvStrengths: document.getElementById("cvStrengths").value,
          cvProfilePicPreview: document.getElementById("cvProfilePicPreview")?.src || "",
          education: getEducationData(),
          projects: getProjectsData(),
     };
     localStorage.setItem("cvForm", JSON.stringify(data));
}

function cvRestoreFormData() {
     const saved = localStorage.getItem("cvForm");
     if (!saved) return;
     const data = JSON.parse(saved);

     for (let key in data) {
          const el = document.getElementById(key);
          if (!el || el.type === "file") continue;
          el.value = data[key];
     }

     if (data.cvProfilePicPreview) {
          const pic = document.getElementById("cvProfilePicPreview");
          if (pic) {
               pic.src = data.cvProfilePicPreview;
               pic.style.display = "block";
          }
     }
}

function clearLocalData() {
     if (confirm("Do you want to clear all saved data?")) {
          localStorage.removeItem("cvForm");
          location.reload();
     }
}


// ========================
// Autosave Inputs
// ========================
function cvAddAutoSaveListeners() {
     document.querySelectorAll("input, textarea, select").forEach(el => {
          el.addEventListener("input", cvSaveFormDataLocally);
     });
}


// ========================
// Education Section
// ========================
function cvAddEducation() {
     const eduSection = document.getElementById("cvEducation-section");
     const eduItem = document.createElement("div");
     eduItem.className = "cvEdu-item";
     eduItem.innerHTML = `
        <label>Class/Degree</label>
        <input type="text" placeholder="e.g., B.Tech, 12th, Diploma" />
        <label>School/College</label>
        <input type="text" placeholder="e.g., XYZ College" />
        <label>Marks/Percentage</label>
        <input type="text" placeholder="e.g., 85%" />
        <label>Year of Passing</label>
        <input type="text" placeholder="e.g., 2024" />
        <button type="button" onclick="removeEducation(this)">Remove</button>
    `;
     eduSection.appendChild(eduItem);

     eduItem.querySelectorAll("input").forEach(el => {
          el.addEventListener("input", cvSaveFormDataLocally);
     });
}

function removeEducation(btn) {
     btn.parentElement.remove();
     cvSaveFormDataLocally();
}

function getEducationData() {
     const eduItems = document.querySelectorAll("#cvEducation-section .cvEdu-item");
     let eduArr = [];
     eduItems.forEach(item => {
          const inputs = item.querySelectorAll("input");
          const [degree, school, marks, year] = Array.from(inputs).map(i => i.value.trim());
          if (degree || school || marks || year) {
               eduArr.push(`
                 <div style="margin-bottom:6px; font-size:1rem; color:#333;">
                    <b>${degree}</b> ||  <span>${school}</span> || Completed in [${year}] - Marks: ${marks}%
                </div>
            `);
          }
     });
     return eduArr.join("");
}


// ========================
// Projects Section
// ========================
function addProject() {
     const section = document.getElementById("cvProjects-section");
     const item = document.createElement("div");
     item.className = "cvProject-item";
     item.innerHTML = `
        <input type="text" placeholder="Project Title" class="cvProject-title" />
        <textarea placeholder="Project Description" class="cvProject-desc"></textarea>
        <button type="button" onclick="removeProject(this)">Remove</button>
    `;
     section.appendChild(item);

     item.querySelectorAll("input, textarea").forEach(el => {
          el.addEventListener("input", cvSaveFormDataLocally);
     });
}

function removeProject(btn) {
     btn.parentElement.remove();
     cvSaveFormDataLocally();
}

function getProjectsData() {
     const items = document.querySelectorAll("#cvProjects-section .cvProject-item");
     let arr = [];
     items.forEach(item => {
          const title = item.querySelector(".cvProject-title").value.trim();
          const desc = item.querySelector(".cvProject-desc").value.trim();
          if (title || desc) arr.push(`<b>${title}</b>${desc ? ": " + desc : ""}`);
     });
     return arr.length ? arr.join("<br>") : "";
}


// ========================
// AI Suggestions
// ========================
function cvSuggestObjective() {
     const objInput = document.getElementById("cvObjective");
     if (!objInput.value.trim())
          objInput.value = "To obtain a challenging position in a reputable organization that allows me to apply my knowledge and skills, grow professionally, and contribute effectively to the team’s success.";
}

function cvSuggestStrengths() {
     const strengthsInput = document.getElementById("cvStrengths");
     if (!strengthsInput.value.trim())
          strengthsInput.value = "Quick Learner, Team Player, Adaptable, Leadership, Time Management";
}

function cvSuggestHobbies() {
     const hobbiesInput = document.getElementById("cvHobbies");
     if (!hobbiesInput.value.trim())
          hobbiesInput.value = "Reading, Music, Coding, Sports, Traveling";
}


// ========================
// Profile Picture Upload
// ========================
function cvHandlePictureUpload(event) {
     const file = event.target.files[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = function (e) {
          const pic = document.getElementById("cvProfilePicPreview");
          pic.src = e.target.result;
          pic.style.display = "block";
          cvSaveFormDataLocally();
     };
     reader.readAsDataURL(file);
}


// ========================
// CV Preview and Download
// ========================
function generateCV() {
     if (!cvValidateForm()) return;

     const education = getEducationData();
     const projects = getProjectsData();
     const pic = document.getElementById("cvProfilePicPreview");
     let profilePicHTML = "";

     if (pic && pic.src && pic.style.display !== "none") {
          profilePicHTML = `<img src="${pic.src}" alt="Profile Picture" style="width:150px;height:155px;object-fit:fill;border-radius:25px;float:right;margin-left:2px;border:2px solid var(--accent);position:relative;right:35px;bottom:20px;">`;
     }

     const data = {
          name: document.getElementById("cvName").value,
          phone: document.getElementById("cvPhone").value,
          email: document.getElementById("cvEmail").value,
          linkedIn: document.getElementById("cvLinkedIn").value,
          objective: document.getElementById("cvObjective").value,
          education,
          skills: document.getElementById("cvSkills").value,
          achievements: document.getElementById("cvAchievements").value,
          languages: document.getElementById("cvLanguages").value,
          projects,
          strengths: document.getElementById("cvStrengths").value,
          hobbies: document.getElementById("cvHobbies").value,
     };

     const html = `
    <div class="a4-page">
        <h2 style="text-align:center; color:var(--accent); margin-top:0;">CV<hr></h2>
        <h2 style="text-align:center; color:var(--accent); margin-top:-6px;">${data.name}</h2>
        <div class="section">
            <h3>Personal Information</h3>
            ${profilePicHTML}
            ${data.phone ? `<p><b>Phone:</b> ${data.phone}</p>` : ""}
            ${data.email ? `<p><b>Email:</b> ${data.email}</p>` : ""}
            ${data.linkedIn ? `<p><b>LinkedIn:</b> <a href="${data.linkedIn}" target="_blank">${data.linkedIn}</a></p>` : ""}
        </div>
        ${data.objective ? `<div class="section"><h3>Career Objective</h3><p>${data.objective}</p></div>` : ""}
        ${data.education ? `<div class="section"><h3>Educational Qualification</h3><p>${data.education}</p></div>` : ""}
        ${data.skills ? `<div class="section"><h3>Technical Skills</h3><ul>${data.skills.split(",").filter(s => s.trim()).map(s => `<li>${s.trim()}</li>`).join("")}</ul></div>` : ""}
        ${data.projects ? `<div class="section"><h3>Projects</h3><p>${data.projects}</p></div>` : ""}
        ${data.achievements ? `<div class="section"><h3>Achievements</h3><p>${data.achievements}</p></div>` : ""}
        ${data.languages ? `<div class="section"><h3>Languages Known</h3><p>${data.languages}</p></div>` : ""}
        ${data.strengths ? `<div class="section"><h3>Strengths</h3><p>${data.strengths}</p></div>` : ""}
        ${data.hobbies ? `<div class="section"><h3>Hobbies</h3><p>${data.hobbies}</p></div>` : ""}
        <div class="section">
            <h3>Declaration</h3>
            <p>I hereby declare that the information provided above is true to the best of my knowledge.</p>
        </div>
        <p style="text-align:right; margin-top:50px;">Signature: ____________________</p>
    </div>`;

     document.getElementById("Preview").innerHTML = html;
     cvSaveFormDataLocally();
}

function refreshForm() {
     if (confirm("Are you sure you want to clear the form and start fresh?")) {
          localStorage.removeItem("cvForm");
          document.querySelectorAll("input, textarea, select").forEach(el => {
               if (el.type === "radio" || el.type === "checkbox") el.checked = false;
               else el.value = "";
          });
          const pic = document.getElementById("cvProfilePicPreview");
          if (pic) {
               pic.src = "";
               pic.style.display = "none";
          }
     }
}


function downloadJPG() {
     generateCV();
     setTimeout(() => {
          const node = document.querySelector('.a4-page');
          if (!node) return alert("Please generate CV preview first.");
          html2canvas(node, { scale: 2 }).then(canvas => {
               const link = document.createElement('a');
               link.download = 'From.jpg';
               link.href = canvas.toDataURL('image/jpeg', 1.0);
               link.click();
          });
     }, 200);
}
