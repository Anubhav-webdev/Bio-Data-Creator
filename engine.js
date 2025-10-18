
// =======================
// Initial Setup
// ========================   

// Show welcome alert only once
window.addEventListener("DOMContentLoaded", () => {
     if (!localStorage.getItem("biodataAlertShown")) {
          alert("😀Welcome to the Biodata Creator! Please fill out the form to generate your biodata.");
          localStorage.setItem("biodataAlertShown", "true");
     }
     // Then run your usual setup
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

     // Validate required text fields
     for (let field of requiredFields) {
          const el = document.getElementById(field.id);
          const value = el ? el.value.trim() : "";
          // remove previous error
          const prevError = document.getElementById(field.id + "-error");
          if (prevError) prevError.remove();

          if (!value) {
               // create error message
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

     // Name validation
     const name = document.getElementById("name")?.value.trim() || "";
     if (name.length < 3) {
          alert("Name must be at least 3 characters long.");
          return false;
     }


     // Profile picture check
     const profilePicPreview = document.getElementById("profilePicPreview");
     const profilePicInput = document.getElementById("profilePic"); // Declare it here

     if (
          !profilePicPreview ||
          !profilePicPreview.src ||
          profilePicPreview.naturalWidth === 0 ||
          profilePicPreview.style.display === "none"
     ) {
          alert("Please upload your Profile Picture.");
          if (profilePicInput) profilePicInput.focus(); // Now this is defined
          return false;
     }



     // Gender selection check
     const gender = document.querySelector('input[name="gender"]:checked');
     if (!gender) {
          alert("Please select your gender.");
          return false;
     }

     // Marital status check
     const marital = document.querySelector('input[name="marital"]:checked');
     if (!marital) {
          alert("Please select your marital status.");
          return false;
     }

     // Email validation
     const email = document.getElementById("email")?.value.trim() || "";
     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailPattern.test(email)) {
          alert("Please enter a valid email address.");
          return false;
     }

     // Phone number validation
     const phone = document.getElementById("phone")?.value.trim() || "";
     if (!/^[0-9]{10}$/.test(phone)) {
          alert("Please enter a valid 10-digit phone number.");
          return false;
     }

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
          religion: document.getElementById("religion").value,
          marital: document.querySelector('input[name="marital"]:checked')?.value || "",
          phone: document.getElementById("phone").value,
          email: document.getElementById("email").value,
          address: document.getElementById("address").value,
          skills: document.getElementById("skills").value,
          languages: document.getElementById("languages").value,
          hobbies: document.getElementById("hobbies").value,
          strengths: document.getElementById("strengths").value,
          profilePic: document.getElementById("profilePicPreview")?.src || "",
          education: getBioEducationData(),

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
function getBioEducationData() {
     const eduItems = document.querySelectorAll("#education-section .edu-item");
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
// AI Suggestions
// ========================
function suggestObjective() {
     const objInput = document.getElementById("objective");
     if (!objInput.value.trim()) objInput.value = "To obtain a challenging position in a reputable organization that allows me to apply my knowledge and skills, grow professionally, and contribute effectively to the team’s success";
}

function suggestStrengths() {
     const items = document.querySelectorAll("#strengths-section .strength-item .strength-input");
     let arr = [];

     items.forEach(input => {
          const val = input.value.trim();
          if (val) arr.push(val);
     });

     const strengthsInput = document.getElementById("strengths");

     if (arr.length) {
          // Use entered strengths
          strengthsInput.value = arr.join(", ");
     } else if (!strengthsInput.value.trim()) {
          // Use default suggestions if empty
          strengthsInput.value = "Quick Learner, Team Player, Adaptable, Leadership, Time Management";
     }

     return strengthsInput.value;
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

     const education = getBioEducationData();
     const pic = document.getElementById("profilePicPreview");
     let profilePicHTML = "";
     if (pic && pic.src && pic.style.display !== "none") {
          profilePicHTML = `<img src="${pic.src}" alt="Profile Picture" style="width:165px;height:175px;object-fit:fill;border-radius:25px;float:right;margin-left:2px;border:2px solid var(--accent);position:relative;right:40px;">`;
     }

     const data = {
          name: document.getElementById("name").value,
          fname: document.getElementById("fname").value,
          dob: document.getElementById("dob").value,
          gender: document.querySelector('input[name="gender"]:checked')?.value || "",
          nationality: document.getElementById("nationality").value,
          religion: document.getElementById("religion").value,
          marital: document.querySelector('input[name="marital"]:checked')?.value || "",
          phone: document.getElementById("phone").value,
          email: document.getElementById("email").value,
          address: document.getElementById("address").value,
          education,
          skills: document.getElementById("skills").value,
          languages: document.getElementById("languages").value,
          strengths: document.getElementById("strengths").value,
          hobbies: document.getElementById("hobbies").value,

     };

     let html = `
    <div class="a4-page">
        <h2 style="text-align:center; color:var(--accent);margin-top: -0px;">Bio-Data <hr></h2>
        <div id="biodataContent">
       
            <h2 style="text-align:center; color:var(--accent); margin-top: -5px;">${data.name || ""}</h2>
            <div class="section">
                <h3>Personal Information</h3>
                     ${profilePicHTML}
                ${data.fname ? `<p><b>Father’s Name:</b> ${data.fname}</p>` : ""}
                ${data.dob ? `<p><b>Date of Birth:</b> ${data.dob}</p>` : ""}
                ${data.gender ? `<p><b>Gender:</b> ${data.gender}</p>` : ""}
                ${data.nationality ? `<p><b>Nationality:</b> ${data.nationality}</p>` : ""}
                ${data.religion ? `<p><b>Religion:</b> ${data.religion}</p>` : ""}
                ${data.marital ? `<p><b>Marital Status:</b> ${data.marital}</p>` : ""}
                ${data.phone ? `<p><b>Contact:</b> ${data.phone}</p>` : ""}
                ${data.email ? `<p><b>Email:</b> ${data.email}</p>` : ""}
                ${data.address ? `<p><b>Address:</b> ${data.address}</p>` : ""}
            </div>
            ${data.education ? `<div class="section"><h3>Educational Qualification</h3><p>${data.education}</p></div>` : ""}
            ${data.skills ? `<div class="section"><h3>Technical Skills</h3><ul>${data.skills
               .split(",")
               .filter(skill => skill.trim())
               .map(skill => `<li>${skill.trim()}</li>`)
               .join("")
               }</ul></div>` : ""}
               ${data.languages ? `<div class="section"><h3>Languages Known</h3><p>${data.languages}</p></div>` : ""}
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
     document.getElementById("Preview").innerHTML = html;
     saveFormDataLocally();
}

function bioRefreshForm() {
     if (confirm("Are you sure you want to clear the form and start fresh?")) {
          localStorage.removeItem("biodataForm");
          document.querySelectorAll("input, textarea, select").forEach(el => {
               if (el.type === "radio" || el.type === "checkbox") el.checked = false;
               else el.value = "";
          });
          const pic = document.getElementById("profilePicPreview");
          if (pic) {
               pic.src = "";
               pic.style.display = "none";
          }
     }
}


function downloadJPG() {
     generateBiodata(); // Ensure preview is up to date
     setTimeout(() => {
          const node = document.querySelector('.a4-page');
          if (!node) return alert("Please generate biodata preview first.");
          html2canvas(node, { scale: 2 }).then(canvas => {
               const link = document.createElement('a');
               link.download = 'From.jpg';
               link.href = canvas.toDataURL('image/jpeg', 1.0);
               link.click();
          });
     }, 200); // Wait for DOM update
}
function changeTheme(theme) {
     document.body.className = theme === "default" ? "" : theme;
}


// ========================
// Toggle Forms
// ========================
function toggleForms() {
     const biodataForm = document.getElementById("biodataForm");
     const cvForm = document.getElementById("cvForm");
     const toggleBtn = document.querySelector(".toggle-btn");
     previousFormData = {}; // to store previous form data


     // Toggle form visibility
     if (biodataForm.style.display === "none") {
          biodataForm.style.display = "block";
          cvForm.style.display = "none";
          document.body.className = "biodata-theme";
          toggleBtn.textContent = "Switch to CV Creator";
          Preview.innerHTML = "Fill out the form to preview your biodata here.";
     } else {
          biodataForm.style.display = "none";
          cvForm.style.display = "block";
          document.body.className = "cv-theme";
          toggleBtn.textContent = "Switch to Biodata Creator";
          Preview.innerHTML = "Fill out the form to preview your CV here.";
     }

     saveFormDataLocally(); // autosave current form data
}
