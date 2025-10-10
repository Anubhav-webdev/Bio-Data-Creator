alert("😀Welcome to the Biodata Creator! Please fill out the form to generate your biodata.");

// ========================
// Initial Setup
// ========================   


window.addEventListener("DOMContentLoaded", () => {
     restoreFormData();
     if (localStorage.getItem("biodataForm")) generateBiodata();
     addAutoSaveListeners();
});

// ========================
// Form Validation
// ========================
function validateForm() {
     const requiredFields = [
          { id: "name", label: "Name" },
          { id: "fname", label: "Father's Name" },
          { id: "dob", label: "Date of Birth" },
          { id: "phone", label: "Contact Number" },
          { id: "email", label: "Email" },
          { id: "address", label: "Address" }
     ];

     for (let field of requiredFields) {
          const value = document.getElementById(field.id)?.value.trim();
          if (!value) {
               alert(`Please fill out the ${field.label} field.`);
               document.getElementById(field.id).focus();
               return false;
          }
     }

     // Profile picture check (file input existence)   
     const profilePicPreview = document.getElementById("profilePicPreview");
     if (!profilePicPreview || !profilePicPreview.src || profilePicPreview.src.includes("default") || profilePicPreview.style.display === "none") {
          alert("Please upload your Profile Picture.");
          document.getElementById("profilePic").focus();
          return false;
     }

     const gender = document.querySelector('input[name="gender"]:checked');
     if (!gender) { alert("Please select your gender."); return false; }

     const marital = document.querySelector('input[name="marital"]:checked');
     if (!marital) { alert("Please select your marital status."); return false; }

     const email = document.getElementById("email").value.trim();
     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailPattern.test(email)) { alert("Please enter a valid email address."); return false; }

     const phone = document.getElementById("phone").value.trim();
     if (!/^[0-9]{10}$/.test(phone)) { alert("Please enter a valid 10-digit phone number."); return false; }

     return true;
}

// ========================
// Local Storage Functions
// ========================
function saveFormDataLocally() {
     const data = {
          name: document.getElementById("name").value,
          fname: document.getElementById("fname").value,
          dob: document.getElementById("dob").value,
          gender: document.querySelector('input[name="gender"]:checked')?.value || "",
          nationality: document.getElementById("nationality").value,
          marital: document.querySelector('input[name="marital"]:checked')?.value || "",
          phone: document.getElementById("phone").value,
          email: document.getElementById("email").value,
          address: document.getElementById("address").value,
          objective: document.getElementById("objective").value,
          skills: document.getElementById("skills").value,
          hobbies: document.getElementById("hobbies").value,
          profilePic: document.getElementById("profilePicPreview")?.src || "",
          education: getEducationData(),
          projects: getProjectsData(),
          strengths: getStrengthsData()
     };
     localStorage.setItem("biodataForm", JSON.stringify(data));
}

function restoreFormData() {
     const saved = localStorage.getItem("biodataForm");
     if (!saved) return;
     const data = JSON.parse(saved);

     for (let key in data) {
          const el = document.getElementById(key);
          if (el && key !== "profilePic") el.value = data[key];
     }

     if (data.gender) {
          const radio = document.querySelector(`input[name="gender"][value="${data.gender}"]`);
          if (radio) radio.checked = true;
     }
     if (data.marital) {
          const radio = document.querySelector(`input[name="marital"][value="${data.marital}"]`);
          if (radio) radio.checked = true;
     }

     if (data.profilePic) {
          const pic = document.getElementById("profilePicPreview");
          pic.src = data.profilePic;
          pic.style.display = "block";
     }
}

function clearLocalData() {
     if (confirm("Do you want to clear all saved data?")) {
          localStorage.removeItem("biodataForm");
          location.reload();
     }
}

// ========================
// Autosave Inputs
// ========================
function addAutoSaveListeners() {
     document.querySelectorAll("input, textarea, select").forEach(el => {
          el.addEventListener("input", saveFormDataLocally);
     });
}

// ========================
// Education Section
// ========================
function addEducation() {
     const eduSection = document.getElementById("education-section");
     const eduItem = document.createElement("div");
     eduItem.className = "edu-item";
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

     // Add autosave to new inputs
     Array.from(eduItem.querySelectorAll("input")).forEach(el => {
          el.addEventListener("input", saveFormDataLocally);
     });
}
function removeEducation(btn) { btn.parentElement.remove(); }
function getEducationData() {
     const eduItems = document.querySelectorAll("#education-section .edu-item");
     let eduArr = [];
     eduItems.forEach(item => {
          const inputs = item.querySelectorAll("input");
          const [degree, school, marks, year] = Array.from(inputs).map(i => i.value.trim());
          if (degree || school || marks || year) {
               eduArr.push(`${degree} at ${school} (${marks}%, ${year})`);
          }
     });
     return eduArr.join("<br>");
}

// ========================
// Projects Section
// ========================
function addProject() {
     const section = document.getElementById("projects-section");
     const item = document.createElement("div");
     item.className = "project-item";
     item.innerHTML = `
        <input type="text" placeholder="Project Title" class="project-title" />
        <textarea placeholder="Project Description" class="project-desc"></textarea>
        <button type="button" onclick="removeProject(this)">Remove</button>
    `;
     section.appendChild(item);

     // Autosave on new inputs
     item.querySelector(".project-title").addEventListener("input", saveFormDataLocally);
     item.querySelector(".project-desc").addEventListener("input", saveFormDataLocally);
}
function removeProject(btn) { btn.parentElement.remove(); }
function getProjectsData() {
     const items = document.querySelectorAll("#projects-section .project-item");
     let arr = [];
     items.forEach(item => {
          const title = item.querySelector(".project-title").value.trim();
          const desc = item.querySelector(".project-desc").value.trim();
          if (title || desc) arr.push(`<b>${title}</b>${desc ? ": " + desc : ""}`);
     });
     return arr.length ? arr.join("<br>") : "";
}

// ========================
// Strengths Section
// ========================
function getStrengthsData() {
     const items = document.querySelectorAll("#strengths-section .strength-item .strength-input");
     let arr = [];
     items.forEach(input => {
          const val = input.value.trim();
          if (val) arr.push(val);
     });
     return arr.length ? arr.join(", ") : "";
}

// ========================
// AI Suggestions
// ========================
function suggestObjective() {
     const objInput = document.getElementById("objective");
     if (!objInput.value.trim()) objInput.value = "To obtain a challenging position in a reputable organization that allows me to apply my knowledge and skills, grow professionally, and contribute effectively to the team’s success";
}
function suggestStrengths() {
     const strengthsInput = document.getElementById("strengths");
     if (!strengthsInput.value.trim()) strengthsInput.value = "Quick Learner, Team Player, Adaptable, Leadership, Time Management";
}
function suggestHobbies() {
     const hobbiesInput = document.getElementById("hobbies");
     if (!hobbiesInput.value.trim()) hobbiesInput.value = "Reading, Music, Coding, Sports, Traveling";
}

// ========================
// Profile Picture
// ========================
function handlePictureUpload(event) {
     const file = event.target.files[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = function (e) {
          const pic = document.getElementById("profilePicPreview");
          pic.src = e.target.result;
          pic.style.display = "block";
          saveFormDataLocally();
     };
     reader.readAsDataURL(file);
}

// ========================
// Biodata Preview & PDF
// ========================
function generateBiodata() {
     if (!validateForm()) return;

     const education = getEducationData();
     const projects = getProjectsData();
     const strengths = getStrengthsData();

     const pic = document.getElementById("profilePicPreview");
     let profilePicHTML = "";
     if (pic && pic.src && pic.style.display !== "none") {
          profilePicHTML = `<img src="${pic.src}" alt="Profile Picture" style="width:170px;height:180px;object-fit:fill;border-radius:25px;float:right;margin-left:2px;border:2px solid var(--accent);position:relative;right:40px;">`;
     }

     const data = {
          name: document.getElementById("name").value,
          fname: document.getElementById("fname").value,
          dob: document.getElementById("dob").value,
          gender: document.querySelector('input[name="gender"]:checked')?.value || "",
          nationality: document.getElementById("nationality").value,
          marital: document.querySelector('input[name="marital"]:checked')?.value || "",
          phone: document.getElementById("phone").value,
          email: document.getElementById("email").value,
          address: document.getElementById("address").value,
          objective: document.getElementById("objective").value,
          education: education,
          skills: document.getElementById("skills").value,
          projects: projects,
          strengths: strengths,
          hobbies: document.getElementById("hobbies").value,
     };

     let html = `
    <div class="a4-page">
        <h2 style="text-align:center; color:var(--accent);">Bio-Data</h2>
        <div id="biodataContent">
       
            <h2 style="text-align:center; color:var(--accent);">${data.name || ""}</h2>
            <div class="section">
                <h3>Personal Information</h3>
                     ${profilePicHTML}
                ${data.fname ? `<p><b>Father’s Name:</b> ${data.fname}</p>` : ""}
                ${data.dob ? `<p><b>Date of Birth:</b> ${data.dob}</p>` : ""}
                ${data.gender ? `<p><b>Gender:</b> ${data.gender}</p>` : ""}
                ${data.nationality ? `<p><b>Nationality:</b> ${data.nationality}</p>` : ""}
                ${data.marital ? `<p><b>Marital Status:</b> ${data.marital}</p>` : ""}
                ${data.phone ? `<p><b>Contact:</b> ${data.phone}</p>` : ""}
                ${data.email ? `<p><b>Email:</b> ${data.email}</p>` : ""}
                ${data.address ? `<p><b>Address:</b> ${data.address}</p>` : ""}
            </div>
            ${data.objective ? `<div class="section"><h3>Career Objective</h3><p>${data.objective}</p></div>` : ""}
            ${data.education ? `<div class="section"><h3>Educational Qualification</h3><p>${data.education}</p></div>` : ""}
            ${data.skills ? `<div class="section"><h3>Technical Skills</h3><ul>${data.skills
               .split(",")
               .filter(skill => skill.trim())
               .map(skill => `<li>${skill.trim()}</li>`)
               .join("")
               }</ul></div>` : ""}
            ${data.projects ? `<div class="section"><h3>Projects</h3><p>${data.projects}</p></div>` : ""}
            ${data.strengths ? `<div class="section"><h3>Strengths</h3><p>${data.strengths}</p></div>` : ""}
            ${data.hobbies ? `<div class="section"><h3>Hobbies</h3><p>${data.hobbies}</p></div>` : ""}
            <div class="section">
                <h3>Declaration</h3>
                <p>I hereby declare that the information provided above is true to the best of my knowledge.</p>
            </div>
            <p style="text-align:right; margin-top:50px;">
                Date: ____________<br>Place: ____________
            </p>
            <p style="text-align:left;">
                Signature: ____________________
            </p>
        </div>
    </div>`;
     document.getElementById("biodataPreview").innerHTML = html;
     saveFormDataLocally();
}

function refreshForm() {
     if (confirm("Are you sure you want to clear the form and start fresh?")) {
          localStorage.removeItem("biodataForm");
          location.reload();
     }
}

function downloadJPG() {
     generateBiodata(); // Ensure preview is up to date
     setTimeout(() => {
          const node = document.querySelector('.a4-page');
          if (!node) return alert("Please generate biodata preview first.");
          html2canvas(node, { scale: 2 }).then(canvas => {
               const link = document.createElement('a');
               link.download = 'Biodata.jpg';
               link.href = canvas.toDataURL('image/jpeg', 1.0);
               link.click();
          });
     }, 200); // Wait for DOM update
}
function changeTheme(theme) {
     document.body.className = theme === "default" ? "" : theme;
}
