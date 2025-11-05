// ========================
// Initial Setup
// ========================
window.addEventListener("DOMContentLoaded", () => {
     cvRestoreFormData();
     if (localStorage.getItem("cvForm")) generateCV();
     cvAddAutoSaveListeners();
});

// ========================
// Validation Helpers
// ========================
const VALIDATION_RULES_CV = {
     name: { pattern: /^[A-Za-z\s]{3,50}$/, message: "Name must be 3-50 characters, letters only" },
     phone: { pattern: /^[0-9]{10}$/, message: "Phone must be exactly 10 digits" },
     email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" },
     linkedin: { pattern: /.*/, message: "Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)" },
     year: { pattern: /^(19|20)\d{2}$/, message: "Please enter a valid year (e.g., 2024)" },
     marks: { pattern: /^([0-9]{1,2}(\.[0-9]{1,2})?|100)%?$/, message: "Marks must be between 0-100" }
};

function cvValidateField(value, ruleKey) {
     if (!VALIDATION_RULES_CV[ruleKey]) return true;
     return VALIDATION_RULES_CV[ruleKey].pattern.test(String(value).trim());
}

function cvShowError(element, message) {
     if (!element) return;
     cvRemoveError(element);
     const err = document.createElement("span");
     err.className = "validation-error";
     err.style.cssText = "color:red;font-size:0.85em;display:block;margin-top:4px;";
     err.textContent = message;
     const parent = element.parentElement || element;
     parent.appendChild(err);
}

function cvRemoveError(element) {
     if (!element) return;
     const parent = element.parentElement || element;
     const existing = parent.querySelector(".validation-error");
     if (existing) existing.remove();
}

function validateImageFile(file) {
     const maxSize = 5 * 1024 * 1024;
     const allowed = ["image/jpeg", "image/png", "image/jpg"];
     if (!file) return { valid: false, message: "Please select an image file" };
     if (!allowed.includes(file.type)) return { valid: false, message: "Allowed types: JPG / PNG" };
     if (file.size > maxSize) return { valid: false, message: "Image must be less than 5MB" };
     return { valid: true };
}

// ========================
// Form Validation
// ========================
function cvValidateForm() {
     let ok = true;

     const required = [
          { id: "cvName", label: "Name", rule: "name" },
          { id: "cvPhone", label: "Phone", rule: "phone" },
          { id: "cvEmail", label: "Email", rule: "email" },
          { id: "cvLinkedIn", label: "LinkedIn", rule: "linkedin" }
     ];

     for (const f of required) {
          const el = document.getElementById(f.id);
          if (!el) continue;
          const v = el.value.trim();
          cvRemoveError(el);
          if (!v) {
               cvShowError(el, `Please fill out the ${f.label} field`);
               if (ok) el.focus();
               ok = false;
               continue;
          }
          if (f.rule && !cvValidateField(v, f.rule)) {
               cvShowError(el, VALIDATION_RULES_CV[f.rule].message);
               if (ok) el.focus();
               ok = false;
          }
     }

     // profile pic
     const picPreview = document.getElementById("cvProfilePicPreview");
     if (!picPreview || !picPreview.src || picPreview.style.display === "none" || picPreview.src === window.location.href) {
          cvShowError(document.getElementById("cvProfilePic") || document.getElementById("cvProjects-section"), "Please upload your Profile Picture");
          ok = false;
     }

     // education entries
     const eduItems = document.querySelectorAll("#cvEducation-section .cvEdu-item");
     if (!eduItems.length) {
          cvShowError(document.getElementById("cvEducation-section"), "Add at least one education entry");
          ok = false;
     } else {
          eduItems.forEach((item, idx) => {
               const inputs = item.querySelectorAll("input");
               if (inputs.length < 4) {
                    cvShowError(item, `Complete Education entry #${idx + 1}`);
                    ok = false;
                    return;
               }
               const [degreeEl, schoolEl, marksEl, yearEl] = inputs;
               const degree = degreeEl.value.trim(), school = schoolEl.value.trim(), marks = marksEl.value.trim(), year = yearEl.value.trim();
               cvRemoveError(degreeEl);
               if (!degree || !school || !marks || !year) {
                    cvShowError(degreeEl, `Complete all fields in Education entry #${idx + 1}`);
                    ok = false;
                    return;
               }
               if (!cvValidateField(marks, "marks")) { cvShowError(marksEl, VALIDATION_RULES_CV.marks.message); ok = false; }
               if (!cvValidateField(year, "year")) { cvShowError(yearEl, VALIDATION_RULES_CV.year.message); ok = false; }
          });
     }

     // skills
     const skillsEl = document.getElementById("cvSkills");
     if (skillsEl && !skillsEl.value.trim()) {
          cvShowError(skillsEl, "Add at least one technical skill");
          ok = false;
     }

     return ok;
}

// ========================
// Local Storage (structured for restore)
// ========================
function cvGetEducationArray() {
     const items = document.querySelectorAll("#cvEducation-section .cvEdu-item");
     const arr = [];
     items.forEach(item => {
          const inputs = item.querySelectorAll("input");
          const [degree, school, marks, year] = Array.from(inputs).map(i => i.value.trim());
          if (degree || school || marks || year) arr.push({ degree, school, marks, year });
     });
     return arr;
}

function cvGetProjectsArray() {
     const items = document.querySelectorAll("#cvProjects-section .cvProject-item");
     const arr = [];
     items.forEach(item => {
          const titleEl = item.querySelector(".cvProject-title");
          const descEl = item.querySelector(".cvProject-desc");
          const title = titleEl ? titleEl.value.trim() : "";
          const desc = descEl ? descEl.value.trim() : "";
          if (title || desc) arr.push({ title, desc });
     });
     return arr;
}

function cvSaveFormDataLocally() {
     const data = {
          cvName: document.getElementById("cvName")?.value || "",
          cvPhone: document.getElementById("cvPhone")?.value || "",
          cvEmail: document.getElementById("cvEmail")?.value || "",
          cvLinkedIn: document.getElementById("cvLinkedIn")?.value || "",
          cvObjective: document.getElementById("cvObjective")?.value || "",
          cvSkills: document.getElementById("cvSkills")?.value || "",
          cvAchievements: document.getElementById("cvAchievements")?.value || "",
          cvLanguages: document.getElementById("cvLanguages")?.value || "",
          cvHobbies: document.getElementById("cvHobbies")?.value || "",
          cvStrengths: document.getElementById("cvStrengths")?.value || "",
          cvProfilePicPreview: document.getElementById("cvProfilePicPreview")?.src || "",
          education: cvGetEducationArray(),
          projects: cvGetProjectsArray()
     };
     localStorage.setItem("cvForm", JSON.stringify(data));
}

function cvRestoreFormData() {
     const saved = localStorage.getItem("cvForm");
     if (!saved) return;
     let data;
     try { data = JSON.parse(saved); } catch (e) { return; }

     // basic fields
     ["cvName", "cvPhone", "cvEmail", "cvLinkedIn", "cvObjective", "cvSkills", "cvAchievements", "cvLanguages", "cvHobbies", "cvStrengths"].forEach(id => {
          const el = document.getElementById(id);
          if (el && data[id] !== undefined) el.value = data[id];
     });

     // profile pic
     if (data.cvProfilePicPreview) {
          const pic = document.getElementById("cvProfilePicPreview");
          if (pic) { pic.src = data.cvProfilePicPreview; pic.style.display = "block"; }
     }

     // restore education array
     if (Array.isArray(data.education)) {
          const container = document.getElementById("cvEducation-section");
          if (container) {
               container.innerHTML = ""; // clear
               data.education.forEach(entry => {
                    cvAddEducation();
                    const last = container.querySelector(".cvEdu-item:last-child");
                    if (last) {
                         const inputs = last.querySelectorAll("input");
                         if (inputs[0]) inputs[0].value = entry.degree || "";
                         if (inputs[1]) inputs[1].value = entry.school || "";
                         if (inputs[2]) inputs[2].value = entry.marks || "";
                         if (inputs[3]) inputs[3].value = entry.year || "";
                    }
               });
          }
     }

     // restore projects array
     if (Array.isArray(data.projects)) {
          const container = document.getElementById("cvProjects-section");
          if (container) {
               container.innerHTML = ""; // clear
               data.projects.forEach(p => {
                    addProject();
                    const last = container.querySelector(".cvProject-item:last-child");
                    if (last) {
                         const t = last.querySelector(".cvProject-title");
                         const d = last.querySelector(".cvProject-desc");
                         if (t) t.value = p.title || "";
                         if (d) d.value = p.desc || "";
                    }
               });
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
     document.querySelectorAll("#cvForm input[type='text'], #cvForm input[type='email'], #cvForm textarea, #cvForm select").forEach(el => {
          el.addEventListener("input", cvSaveFormDataLocally);
     });

     // blur validation for key fields
     document.querySelectorAll("#cvForm #cvName, #cvForm #cvPhone, #cvForm #cvEmail, #cvForm #cvLinkedIn").forEach(el => {
          el.addEventListener("blur", () => {
               const id = el.id.replace(/^cv/, "").toLowerCase();
               if (VALIDATION_RULES_CV[id]) {
                    if (!cvValidateField(el.value, id)) cvShowError(el, VALIDATION_RULES_CV[id].message);
                    else cvRemoveError(el);
               }
          });
     });
}

// ========================
// Education Section
// ========================
function cvAddEducation() {
     const eduSection = document.getElementById("cvEducation-section");
     if (!eduSection) return;
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
        <button type="button" class="cv-edu-remove">Remove</button>
    `;
     eduSection.appendChild(eduItem);

     eduItem.querySelectorAll("input").forEach(el => el.addEventListener("input", cvSaveFormDataLocally));
     eduItem.querySelector(".cv-edu-remove").addEventListener("click", () => { eduItem.remove(); cvSaveFormDataLocally(); });
}

function removeEducation(btn) {
     const parent = btn.parentElement;
     if (parent) { parent.remove(); cvSaveFormDataLocally(); }
}

function getEducationData() {
     // return HTML for preview (used by generateCV)
     return cvGetEducationArray().map(e => `
          <div style="margin-bottom:6px; font-size:1rem; color:#333;">
               <b>${e.degree}</b> || <span>${e.school}</span> || Completed in [${e.year}] - Marks: ${e.marks}%
          </div>
     `).join("");
}

// ========================
// Projects Section
// ========================
function addProject() {
     const section = document.getElementById("cvProjects-section");
     if (!section) return;
     const item = document.createElement("div");
     item.className = "cvProject-item";
     item.innerHTML = `
        <input type="text" placeholder="Project Title" class="cvProject-title" />
        <textarea placeholder="Project Description" class="cvProject-desc"></textarea>
        <button type="button" class="cv-project-remove">Remove</button>
    `;
     section.appendChild(item);

     item.querySelectorAll("input, textarea").forEach(el => el.addEventListener("input", cvSaveFormDataLocally));
     item.querySelector(".cv-project-remove").addEventListener("click", () => { item.remove(); cvSaveFormDataLocally(); });
}

function removeProject(btn) {
     const parent = btn.parentElement;
     if (parent) { parent.remove(); cvSaveFormDataLocally(); }
}

function getProjectsData() {
     return cvGetProjectsArray().map(p => `
          <div style="margin-bottom:6px;">
               <b>${p.title}</b>${p.desc ? `: ${p.desc}` : ""}
          </div>
     `).join("");
}

// ========================
// AI Suggestions
// ========================
function cvSuggestObjective() {
     const el = document.getElementById("cvObjective");
     if (el && !el.value.trim()) el.value = "To obtain a challenging position in a reputable organization that allows me to apply my knowledge and skills, grow professionally, and contribute effectively to the team’s success.";
}
function cvSuggestStrengths() {
     const el = document.getElementById("cvStrengths");
     if (el && !el.value.trim()) el.value = "Quick Learner, Team Player, Adaptable, Leadership, Time Management";
}
function cvSuggestHobbies() {
     const el = document.getElementById("cvHobbies");
     if (el && !el.value.trim()) el.value = "Reading, Music, Coding, Sports, Traveling";
}

// ========================
// Profile Picture Upload
// ========================
function cvHandlePictureUpload(event) {
     const file = event.target.files[0];
     const check = validateImageFile(file);
     if (!check.valid) {
          alert(check.message);
          event.target.value = "";
          return;
     }

     const loading = document.createElement("div");
     loading.textContent = "Processing image...";
     loading.style.cssText = "color:var(--accent);font-size:0.9rem;margin-top:5px;";
     event.target.parentElement.appendChild(loading);

     const reader = new FileReader();
     reader.onload = e => {
          const img = new Image();
          img.onload = () => {
               if (img.width < 100 || img.height < 100) {
                    alert("Image dimensions too small. Min 100x100px required.");
                    event.target.value = "";
                    loading.remove();
                    return;
               }
               const pic = document.getElementById("cvProfilePicPreview");
               if (pic) { pic.src = e.target.result; pic.style.display = "block"; }
               loading.remove();
               cvSaveFormDataLocally();
          };
          img.src = e.target.result;
     };
     reader.readAsDataURL(file);
}

// ========================
// CV Preview and Download
// ========================
function generateCV() {
     if (!cvValidateForm()) return;

     const educationHTML = getEducationData();
     const projectsHTML = getProjectsData();
     const pic = document.getElementById("cvProfilePicPreview");
     let profilePicHTML = "";
     if (pic && pic.src && pic.style.display !== "none") {
          profilePicHTML = `<img src="${pic.src}" alt="Profile Picture" style="width:150px;height:155px;object-fit:cover;border-radius:25px;float:right;margin-left:2px;border:2px solid var(--accent);position:relative;right:35px;bottom:20px;">`;
     }

     const data = {
          name: document.getElementById("cvName")?.value || "",
          phone: document.getElementById("cvPhone")?.value || "",
          email: document.getElementById("cvEmail")?.value || "",
          linkedIn: document.getElementById("cvLinkedIn")?.value || "",
          objective: document.getElementById("cvObjective")?.value || "",
          education: educationHTML,
          skills: document.getElementById("cvSkills")?.value || "",
          achievements: document.getElementById("cvAchievements")?.value || "",
          languages: document.getElementById("cvLanguages")?.value || "",
          projects: projectsHTML,
          strengths: document.getElementById("cvStrengths")?.value || "",
          hobbies: document.getElementById("cvHobbies")?.value || ""
     };

     document.getElementById("Preview").innerHTML = `
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
        ${data.education ? `<div class="section"><h3>Educational Qualification</h3>${data.education}</div>` : ""}
        ${data.skills ? `<div class="section"><h3>Technical Skills</h3><ul>${data.skills.split(",").filter(s => s.trim()).map(s => `<li>${s.trim()}</li>`).join("")}</ul></div>` : ""}
        ${data.projects ? `<div class="section"><h3>Projects</h3>${data.projects}</div>` : ""}
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

     cvSaveFormDataLocally();
}

function refreshForm() {
     if (confirm("Are you sure you want to clear the form and start fresh?")) {
          localStorage.removeItem("cvForm");
          document.querySelectorAll("#cvForm input, #cvForm textarea, #cvForm select").forEach(el => {
               if (el.type === "radio" || el.type === "checkbox") el.checked = false;
               else el.value = "";
          });
          const pic = document.getElementById("cvProfilePicPreview");
          if (pic) { pic.src = ""; pic.style.display = "none"; }
          const edu = document.getElementById("cvEducation-section"); if (edu) edu.innerHTML = "";
          const proj = document.getElementById("cvProjects-section"); if (proj) proj.innerHTML = "";
          document.getElementById("Preview").innerHTML = "Fill out the form to preview your CV.";
     }
}

function cvHandleError(message) {
     console.error(message);
     alert(message);
}

function downloadJPGcv() {
     try {
          generateCV();
          setTimeout(() => {
               const node = document.querySelector('.a4-page');
               if (!node) throw new Error("Please generate CV preview first.");
               html2canvas(node, { scale: 2, logging: false, useCORS: true }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'CV.jpg';
                    link.href = canvas.toDataURL('image/jpeg', 1.0);
                    link.click();
               }).catch(err => cvHandleError("Error generating image: " + err.message));
          }, 200);
     } catch (err) { cvHandleError(err.message); }
}
