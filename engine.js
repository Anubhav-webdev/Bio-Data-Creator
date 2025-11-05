// =======================
// Initial Setup
// ========================
window.addEventListener("DOMContentLoaded", () => {
     if (!localStorage.getItem("biodataAlertShown")) {
          alert("😀Welcome to the Biodata Creator! Please fill out the form to generate your biodata.");
          localStorage.setItem("biodataAlertShown", "true");
     }
     restoreFormData();
     if (localStorage.getItem("biodataForm")) generateBiodata();
     addAutoSaveListeners();
});


// ========================
// Validation Helper Functions
// ========================
const VALIDATION_RULES = {
     name: {
          pattern: /^[A-Za-z\s]{3,50}$/,
          message: "Name must be 3-50 characters, letters only"
     },
     phone: {
          pattern: /^[0-9]{10}$/,
          message: "Phone must be exactly 10 digits"
     },
     email: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Please enter a valid email address"
     },
     year: {
          pattern: /^(19|20)\d{2}$/,
          message: "Please enter a valid year (e.g., 2024)"
     },
     marks: {
          pattern: /^([0-9]{1,2}(\.[0-9]{1,2})?|100)%?$/,
          message: "Marks must be between 0-100"
     }
};

function validateField(value, type) {
     if (!VALIDATION_RULES[type]) return true;
     return VALIDATION_RULES[type].pattern.test(value.trim());
}

function showError(element, message) {
     removeError(element);
     const error = document.createElement("span");
     error.className = "validation-error";
     error.style.cssText = "color:red;font-size:0.8em;display:block;margin-top:4px;";
     error.textContent = message;
     element.parentElement.appendChild(error);
}

function removeError(element) {
     const existingError = element?.parentElement?.querySelector(".validation-error");
     if (existingError) existingError.remove();
}

function validateImage(file) {
     const maxSize = 5 * 1024 * 1024; // 5MB
     const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

     if (!file) return { valid: false, message: "Please select an image file" };
     if (file.size > maxSize) return { valid: false, message: "Image must be less than 5MB" };
     if (!validTypes.includes(file.type)) return { valid: false, message: "Please upload JPG or PNG images only" };

     return { valid: true };
}


// ========================
// Form Validation
// ========================
function validateForm() {
     let isValid = true;

     const requiredFields = [
          { id: "name", label: "Name", type: "name" },
          { id: "fname", label: "Father's Name", type: "name" },
          { id: "phone", label: "Contact Number", type: "phone" },
          { id: "email", label: "Email", type: "email" },
          { id: "dob", label: "Date of Birth" },
          { id: "address", label: "Address" }
     ];

     requiredFields.forEach(field => {
          const el = document.getElementById(field.id);
          const value = el?.value.trim() || "";

          removeError(el);

          if (!value) {
               showError(el, `Please fill out the ${field.label} field`);
               if (isValid) el.focus();
               isValid = false;
               return;
          }

          if (field.type && !validateField(value, field.type)) {
               showError(el, VALIDATION_RULES[field.type].message);
               if (isValid) el.focus();
               isValid = false;
          }
     });

     const profilePicPreview = document.getElementById("profilePicPreview");
     if (!profilePicPreview?.src ||
          profilePicPreview.style.display === "none" ||
          profilePicPreview.src === window.location.href) {
          showError(document.getElementById("profilePic"), "Please upload your Profile Picture");
          isValid = false;
     }

     const gender = document.querySelector('input[name="gender"]:checked');
     if (!gender) {
          showError(document.querySelector('input[name="gender"]'), "Please select your gender");
          isValid = false;
     }

     const marital = document.querySelector('input[name="marital"]:checked');
     if (!marital) {
          showError(document.querySelector('input[name="marital"]'), "Please select your marital status");
          isValid = false;
     }

     const eduItems = document.querySelectorAll("#education-section .edu-item");
     if (!eduItems.length) {
          showError(document.getElementById("education-section"), "Add at least one education entry");
          isValid = false;
     } else {
          eduItems.forEach((item, index) => {
               const inputs = item.querySelectorAll("input");
               const [degree, school, marks, year] = Array.from(inputs).map(i => i.value.trim());

               if (!degree || !school || !marks || !year) {
                    showError(inputs[0], `Complete all fields in Education entry #${index + 1}`);
                    isValid = false;
                    return;
               }

               if (!validateField(marks, "marks")) {
                    showError(inputs[2], VALIDATION_RULES.marks.message);
                    isValid = false;
               }

               if (!validateField(year, "year")) {
                    showError(inputs[3], VALIDATION_RULES.year.message);
                    isValid = false;
               }
          });
     }

     return isValid;
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
// Image Upload
// ========================
function handlePictureUpload(event) {
     const file = event.target.files[0];
     const validation = validateImage(file);

     if (!validation.valid) {
          alert(validation.message);
          event.target.value = '';
          return;
     }

     const loadingEl = document.createElement('div');
     loadingEl.textContent = 'Processing image...';
     loadingEl.style.cssText = 'color:var(--accent);font-size:0.9rem;margin-top:5px;';
     event.target.parentElement.appendChild(loadingEl);

     const reader = new FileReader();
     reader.onload = function (e) {
          const img = new Image();
          img.onload = function () {
               if (img.width < 100 || img.height < 100) {
                    alert("Image dimensions too small. Min 100x100px required.");
                    event.target.value = '';
                    loadingEl.remove();
                    return;
               }

               const pic = document.getElementById("profilePicPreview");
               if (pic) {
                    pic.src = e.target.result;
                    pic.style.display = "block";
                    loadingEl.remove();
                    saveFormDataLocally();
               }
          };
          img.src = e.target.result;
     };
     reader.readAsDataURL(file);
}


// ========================
// Real-Time Validation + AutoSave
// ========================
function addAutoSaveListeners() {
     document.querySelectorAll("input[type='text'], input[type='email']").forEach(el => {
          el.addEventListener("blur", () => {
               const fieldType = el.id;
               if (VALIDATION_RULES[fieldType]) {
                    const value = el.value.trim();
                    if (value && !validateField(value, fieldType)) {
                         showError(el, VALIDATION_RULES[fieldType].message);
                    } else {
                         removeError(el);
                    }
               }
          });
          el.addEventListener("input", saveFormDataLocally);
     });

     document.querySelectorAll("textarea, select, input[type='radio']").forEach(el => {
          el.addEventListener("input", saveFormDataLocally);
     });
}


// ========================
// Biodata Generation, Theme, Toggle, Download
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
               .join("")}</ul></div>` : ""}
            ${data.languages ? `<div class="section"><h3>Languages Known</h3><p>${data.languages}</p></div>` : ""}
            ${data.strengths ? `<div class="section"><h3>Strengths</h3><p>${data.strengths}</p></div>` : ""}
            ${data.hobbies ? `<div class="section"><h3>Hobbies</h3><p>${data.hobbies}</p></div>` : ""}
            <div class="section">
                <h3>Declaration</h3>
                <p>I hereby declare that the information provided above is true to the best of my knowledge.</p>
            </div>
            <p style="text-align:right; margin-top:50px;">Date: ____________<br>Place: ____________</p>
            <p style="text-align:left;">Signature: ____________________</p>
        </div>
    </div>`;
     document.getElementById("Preview").innerHTML = html;
     saveFormDataLocally();
}


function downloadJPG() {
     generateBiodata();
     setTimeout(() => {
          const node = document.querySelector('.a4-page');
          if (!node) return alert("Please generate biodata preview first.");
          html2canvas(node, { scale: 2 }).then(canvas => {
               const link = document.createElement('a');
               link.download = 'Biodata.jpg';
               link.href = canvas.toDataURL('image/jpeg', 1.0);
               link.click();
          });
     }, 200);
}

function changeTheme(theme) {
     document.body.className = theme === "default" ? "" : theme;
     localStorage.setItem("selectedTheme", theme);
}

function toggleForms() {
     const biodataForm = document.getElementById("biodataForm");
     const cvForm = document.getElementById("cvForm");
     const toggleBtn = document.querySelector(".toggle-btn");
     const preview = document.getElementById("Preview");

     if (biodataForm.style.display === "none") {
          biodataForm.style.display = "block";
          cvForm.style.display = "none";
          document.body.className = "biodata-theme";
          toggleBtn.textContent = "Switch to CV Creator";
          preview.innerHTML = "Fill out the form to preview your biodata here.";
     } else {
          biodataForm.style.display = "none";
          cvForm.style.display = "block";
          document.body.className = "cv-theme";
          toggleBtn.textContent = "Switch to Biodata Creator";
          preview.innerHTML = "Fill out the form to preview your CV here.";
     }
}
// Add this function
function bioRefreshForm() {
     if (confirm("Are you sure you want to clear the form and start fresh?")) {
          localStorage.removeItem("biodataForm");
          document.querySelectorAll("#biodataForm input, #biodataForm textarea").forEach(el => {
               if (el.type === "radio" || el.type === "checkbox") el.checked = false;
               else el.value = "";
          });
          const pic = document.getElementById("profilePicPreview");
          if (pic) {
               pic.src = "";
               pic.style.display = "none";
          }
          document.getElementById("Preview").innerHTML = "Fill out the form to preview your biodata.";
     }
}

// Add suggestions functions
function suggestStrengths() {
     const strengthsInput = document.getElementById("strengths");
     if (!strengthsInput.value.trim()) {
          strengthsInput.value = "Quick Learner, Team Player, Adaptable, Leadership, Time Management";
     }
}

function suggestHobbies() {
     const hobbiesInput = document.getElementById("hobbies");
     if (!hobbiesInput.value.trim()) {
          hobbiesInput.value = "Reading, Music, Coding, Sports, Traveling";
     }
}
