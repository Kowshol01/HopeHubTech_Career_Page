AOS.init({
  duration: 800,
  once: true,
});
feather.replace();

// --- Theme toggle functionality ---
const themeToggle = document.getElementById("theme-toggle");
const themeMenu = document.getElementById("theme-menu");
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");

themeToggle.addEventListener("click", () =>
  themeMenu.classList.toggle("hidden")
);

document.querySelectorAll("#theme-menu button").forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.theme;
    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
    updateTheme();
    themeMenu.classList.add("hidden");
  });
});

function updateTheme() {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  } else {
    document.documentElement.classList.remove("dark");
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  }
}

updateTheme();
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", updateTheme);

lucide.createIcons();

// Multi-Step Form Script

// Form navigation logic
let currentStep = 1;
const totalSteps = 6;

document.getElementById("stepCounter").textContent =
  `Step ${currentStep} of ${totalSteps}`;

function updateProgress() {
  const progress = ((currentStep - 1) / totalSteps) * 100;
  document.getElementById("progress").style.width = `${progress}%`;
}

function resetStepUI(step) {
  if (!step) return;
  if (step === 3) {
    document.querySelectorAll('#step3 input[type="radio"]').forEach((radio) => {
      const parent = radio.parentElement;
      parent.classList.remove("hidden");
    });
    clearQuickQuestionsBtn.classList.add("hidden");
  }
  if (step === 4) {
    document.querySelectorAll("#positionsContainer label").forEach((label) => {
      label.classList.remove("hidden");
    });
    document.getElementById("clearPosition").classList.add("hidden");
  }
}

function showStep(step) {
  const previousStepEl = document.querySelector(".form-step.active");

  // If there was a previous step, reset its UI (un-hide options)
  if (previousStepEl) {
    const previousStepId = parseInt(previousStepEl.id.replace("step", ""));
    resetStepUI(previousStepId);
  }

  // Hide all steps to be safe
  document.querySelectorAll(".form-step").forEach((el) => {
    el.classList.remove("active");
  });

  document.getElementById(`step${step}`).classList.add("active");

  document.getElementById("stepCounter").textContent =
    `Step ${step} of ${totalSteps}`;

  document.getElementById("prevBtn").classList.toggle("hidden", step === 1);
  document.getElementById("nextBtn").innerHTML =
    step === totalSteps
      ? 'Submit <i data-feather="send" class="w-4 h-4 inline ml-1"></i>'
      : 'Next <i data-feather="chevron-right" class="w-4 h-4 inline ml-1"></i>';

  feather.replace();
}

function nextStep() {
  if (validateStep(currentStep)) {
    if (currentStep < totalSteps) {
      currentStep++;
      updateProgress();
      showStep(currentStep);
    } else {
      // This block handles the final submission click
      const nextButton = document.getElementById("nextBtn");
      nextButton.disabled = true;
      nextButton.innerHTML =
        'Submitting... <i data-feather="loader" class="w-4 h-4 inline ml-1 animate-spin"></i>';
      feather.replace();

      handleFormSubmit();
    }
  }
}

// --- NEW FUNCTION FOR GETFORM.IO SUBMISSION ---
function handleFormSubmit() {
  const form = document.getElementById("multiStepApplicationForm");
  const getformURL = form.action;
  const formData = new FormData(form);

  // Manually append data from custom components (checkboxes and skills) that FormData might miss
  const positions = Array.from(
    document.querySelectorAll('input[name="positions"]:checked')
  )
    .map((cb) => cb.value)
    .join(", ");
  formData.append("Selected Positions", positions);

  const skills = Array.from(document.getElementById("selectedSkills").children)
    .map((el) => el.querySelector("span").textContent.trim())
    .join(", ");
  formData.append("Skills", skills);

  fetch(getformURL, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        console.log("Success! Form submitted to Getform.io.");
        // Show the "Thank You" step after successful submission
        document.getElementById("step6").classList.remove("active");
        document.getElementById("step7").classList.add("active");
        document.getElementById("prevBtn").classList.add("hidden");
        document.getElementById("nextBtn").classList.add("hidden");
        document.getElementById("stepCounter").textContent =
          "Application Complete!";
        document.getElementById("progress").style.width = "100%";
      } else {
        // Handle server errors (e.g., 4xx, 5xx)
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      console.error("Error!", error.message);
      alert(
        "There was an error submitting your application. Please try again."
      );
      // Re-enable the submit button on error
      const nextButton = document.getElementById("nextBtn");
      nextButton.disabled = false;
      nextButton.innerHTML =
        'Submit <i data-feather="send" class="w-4 h-4 inline ml-1"></i>';
      feather.replace();
    });
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateProgress();
    showStep(currentStep);
  }
}

function validateStep(step) {
  let isValid = true;

  if (step === 1) {
    const requiredFields = ["fullName", "email", "phone", "division", "city"];
    requiredFields.forEach((field) => {
      if (!checkFieldValidity(document.getElementById(field))) isValid = false;
    });
  }

  if (step === 2) {
    if (!checkFieldValidity(document.getElementById("highestDegree")))
      isValid = false;
    if (!checkFieldValidity(document.getElementById("fieldOfStudy")))
      isValid = false;
  }

  if (step === 3) {
    const requiredRadios = [
      "smartphone",
      "internet",
      "pc",
      "regularInternet",
      "remoteJob",
    ];
    requiredRadios.forEach((radioName) => {
      const questionLabel = document
        .querySelector(`input[name="${radioName}"]`)
        .closest(".grid").previousElementSibling;
      if (!document.querySelector(`input[name="${radioName}"]:checked`)) {
        isValid = false;
        questionLabel.classList.add("text-red-500");
      } else {
        questionLabel.classList.remove("text-red-500");
      }
    });

    // START: MODIFIED VALIDATION
    if (!checkFieldValidity(document.getElementById("familyIncome")))
      isValid = false;
    // END: MODIFIED VALIDATION
  }

  if (step === 4) {
    const positionsEl = document.querySelector("#step4 > div > p");
    if (!document.querySelector('input[name="positions"]:checked')) {
      isValid = false;
      positionsEl.classList.add("text-red-500");
    } else {
      positionsEl.classList.remove("text-red-500");
    }
  }

  if (step === 5) {
    const selectedSkills =
      document.getElementById("selectedSkills").children.length;
    const skillRequiredPositions = [
      "UI/UX Designer",
      "Graphics Designer",
      "Web Developer",
      "Website Maintenance Specialist",
    ];
    let skillRequired = false;

    skillRequiredPositions.forEach((pos) => {
      if (
        document.querySelector(
          `input[name="positions"][value="${pos}"]:checked`
        )
      ) {
        skillRequired = true;
      }
    });

    const skillInputEl = document.getElementById("skillInput");
    if (skillRequired && selectedSkills === 0) {
      isValid = false;
      skillInputEl.classList.add("border-red-500", "dark:border-red-500");
    } else {
      skillInputEl.classList.remove("border-red-500", "dark:border-red-500");
    }
  }

  if (step === 6) {
    const uploadContainer = document.getElementById("uploadContainer");
    if (!document.getElementById("cvUpload").files.length) {
      isValid = false;
      uploadContainer
        .querySelector("label")
        .classList.add("border-red-500", "dark:border-red-500");
    } else {
      uploadContainer
        .querySelector("label")
        .classList.remove("border-red-500", "dark:border-red-500");
    }
  }

  return isValid;
}

const locations = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Tangail",
    "Manikganj",
    "Munshiganj",
  ],
  Chittagong: ["Chittagong", "Cox's Bazar", "Comilla", "Feni", "Brahmanbaria"],
  Khulna: ["Khulna", "Jessore", "Satkhira", "Bagerhat"],
  Sylhet: ["Sylhet", "Sunamganj", "Habiganj", "Moulvibazar"],
  Rajshahi: ["Rajshahi", "Bogra", "Pabna", "Naogaon"],
  Barisal: ["Barisal", "Patuakhali", "Bhola"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
  Rangpur: ["Rangpur", "Dinajpur", "Gaibandha"],
};

const divisionSelect = document.getElementById("division");
const citySelect = document.getElementById("city");

for (const division in locations) {
  const option = document.createElement("option");
  option.value = division;
  option.textContent = division;
  divisionSelect.appendChild(option);
}

divisionSelect.addEventListener("change", function () {
  const selectedDivision = this.value;
  citySelect.innerHTML =
    '<option value="" disabled selected>Select your city</option>';
  citySelect.disabled = true;

  if (selectedDivision) {
    citySelect.disabled = false;
    locations[selectedDivision].forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }
});

const studyFields = [
  "Computer Science and Engineering",
  "Electrical and Electronic Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Marketing",
  "Finance",
  "Accounting",
  "MBBS (Medicine)",
  "Pharmacy",
  "English Literature",
  "Bengali Literature",
  "Economics",
  "Sociology",
  "Law",
  "Architecture",
  "Physics",
  "Chemistry",
  "Mathematics",
];

const fieldOfStudyInput = document.getElementById("fieldOfStudy");
const studySuggestions = document.getElementById("studySuggestions");

fieldOfStudyInput.addEventListener("input", function () {
  const input = this.value.toLowerCase();
  if (input.length > 1) {
    const matches = studyFields.filter((field) =>
      field.toLowerCase().includes(input)
    );
    if (matches.length > 0) {
      studySuggestions.innerHTML = matches
        .map(
          (field) =>
            `<div class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" onclick="selectStudyField('${field}')">${field}</div>`
        )
        .join("");
      studySuggestions.classList.remove("hidden");
    } else {
      studySuggestions.classList.add("hidden");
    }
  } else {
    studySuggestions.classList.add("hidden");
  }
});

function selectStudyField(field) {
  fieldOfStudyInput.value = field;
  studySuggestions.classList.add("hidden");
  checkFieldValidity(fieldOfStudyInput);
}

const skills = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "PHP",
  "Python",
  "Java",
  "C#",
  "UI Design",
  "UX Design",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "InDesign",
  "WordPress",
  "SEO",
  "Content Writing",
  "Social Media Marketing",
  "Google Ads",
  "Facebook Ads",
  "Email Marketing",
  "Project Management",
  "Agile",
  "Scrum",
  "Git",
  "Responsive Design",
  "Bootstrap",
  "Tailwind CSS",
  "SASS",
  "LESS",
  "MySQL",
  "MongoDB",
  "REST API",
  "GraphQL",
  "Docker",
  "AWS",
  "Google Cloud",
  "Azure",
];

const skillInput = document.getElementById("skillInput");
const skillSuggestions = document.getElementById("skillSuggestions");
const addSkillBtn = document.getElementById("addSkillBtn");

skillInput.addEventListener("input", function () {
  const input = this.value.toLowerCase();
  if (input.length > 1) {
    const matches = skills.filter((skill) =>
      skill.toLowerCase().includes(input)
    );
    if (matches.length > 0) {
      skillSuggestions.innerHTML = matches
        .map(
          (skill) =>
            `<div class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" onclick="addSkill('${skill}')">${skill}</div>`
        )
        .join("");
      skillSuggestions.classList.remove("hidden");
    } else {
      skillSuggestions.classList.add("hidden");
    }
  } else {
    skillSuggestions.classList.add("hidden");
  }
});

skillInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const skill = this.value.trim();
    if (skill) {
      addSkill(skill);
    }
  }
});

addSkillBtn.addEventListener("click", function () {
  const skill = skillInput.value.trim();
  if (skill) {
    addSkill(skill);
  }
  skillInput.focus();
});

function addSkill(skill) {
  const selectedSkills = document.getElementById("selectedSkills");
  const existingSkills = Array.from(selectedSkills.children).map((el) =>
    el.querySelector("span").textContent.trim()
  );

  if (!existingSkills.includes(skill)) {
    const skillTag = document.createElement("div");
    skillTag.className =
      "skill-tag bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm flex items-center";
    skillTag.innerHTML = `<span>${skill}</span> <button type="button" onclick="removeSkill(this)" class="ml-2 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"><i data-feather="x" class="w-3 h-3"></i></button>`;
    selectedSkills.appendChild(skillTag);
    feather.replace();
  }
  document.getElementById("skillInput").value = "";
  document.getElementById("skillSuggestions").classList.add("hidden");
}

function removeSkill(button) {
  button.parentElement.remove();
}

const cvUploadInput = document.getElementById("cvUpload");
const uploadContainer = document.getElementById("uploadContainer");
const fileInfoContainer = document.getElementById("fileInfo");
const fileNameSpan = document.getElementById("fileName");
const removeFileBtn = document.getElementById("removeFileBtn");

cvUploadInput.addEventListener("change", function () {
  if (this.files.length > 0) {
    fileNameSpan.textContent = this.files[0].name;
    uploadContainer.classList.add("hidden");
    fileInfoContainer.classList.remove("hidden");
    feather.replace();
  }
});

removeFileBtn.addEventListener("click", function () {
  cvUploadInput.value = "";
  fileInfoContainer.classList.add("hidden");
  uploadContainer.classList.remove("hidden");
  fileNameSpan.textContent = "";
});

document.addEventListener("click", function (e) {
  if (
    !document.getElementById("fieldOfStudy").contains(e.target) &&
    !document.getElementById("studySuggestions").contains(e.target)
  ) {
    document.getElementById("studySuggestions").classList.add("hidden");
  }

  if (
    !document.getElementById("skillInput").contains(e.target) &&
    !document.getElementById("skillSuggestions").contains(e.target)
  ) {
    document.getElementById("skillSuggestions").classList.add("hidden");
  }
});

// Styling for custom radio and checkboxes
const greenClasses = [
  "border-green-500",
  "dark:border-green-500",
  "bg-green-50",
  "dark:bg-green-900/50",
];
const redClasses = [
  "border-red-500",
  "dark:border-red-500",
  "bg-red-50",
  "dark:bg-red-900/50",
];

function handleRadioStyling() {
  document.querySelectorAll('#step3 input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const currentRadio = e.target;
      const groupName = currentRadio.name;

      const questionLabel =
        currentRadio.closest(".grid").previousElementSibling;
      questionLabel.classList.remove("text-red-500");

      document.querySelectorAll(`input[name="${groupName}"]`).forEach((r) => {
        const label = r.parentElement;
        label.classList.remove(...greenClasses, ...redClasses);
        if (r.value === "yes") {
          label.querySelector(".check-icon").classList.add("opacity-0");
        } else {
          label.querySelector(".check-icon").classList.add("opacity-0");
        }
      });

      if (currentRadio.checked) {
        const parentLabel = currentRadio.parentElement;
        const otherLabel = parentLabel.parentElement.querySelector(
          `label:not([for="${parentLabel.getAttribute("for")}"])`
        );
        parentLabel.classList.add(...greenClasses);
        parentLabel.querySelector(".check-icon").classList.remove("opacity-0");
        parentLabel.parentElement
          .querySelector(
            `input[value="${currentRadio.value === "yes" ? "no" : "yes"}"]`
          )
          .parentElement.classList.add("hidden");
      }
      clearQuickQuestionsBtn.classList.remove("hidden");
    });
  });
}

const clearPositionBtn = document.getElementById("clearPosition");
const clearQuickQuestionsBtn = document.getElementById("clearQuickQuestions");

function handleCheckboxStyling() {
  const positionLabels = document.querySelectorAll("#positionsContainer label");
  document
    .querySelectorAll('#step4 input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const currentCheckbox = e.target;
        const parentLabel = currentCheckbox.parentElement;
        const icon = parentLabel.querySelector(".check-icon");

        if (currentCheckbox.checked) {
          parentLabel.classList.add(...greenClasses);
          if (icon) icon.classList.remove("opacity-0");

          positionLabels.forEach((label) => {
            if (label !== parentLabel) {
              label.classList.add("hidden");
            }
          });
          clearPositionBtn.classList.remove("hidden");
        } else {
          // Should not happen with this logic but for safety
          parentLabel.classList.remove(...greenClasses);
          if (icon) icon.classList.add("opacity-0");
        }
      });
    });
}

clearPositionBtn.addEventListener("click", () => {
  document.querySelectorAll("#positionsContainer label").forEach((label) => {
    label.classList.remove("hidden");
    label.classList.remove(...greenClasses);
    label.querySelector(".check-icon").classList.add("opacity-0");
    label.querySelector("input").checked = false;
  });
  clearPositionBtn.classList.add("hidden");
});

clearQuickQuestionsBtn.addEventListener("click", () => {
  document.querySelectorAll("#step3 .grid").forEach((grid) => {
    const radioInputs = grid.querySelectorAll('input[type="radio"]');
    const questionLabel = grid.previousElementSibling;
    questionLabel.classList.remove("text-red-500");

    radioInputs.forEach((radio) => {
      radio.checked = false;
      const parentLabel = radio.parentElement;
      parentLabel.classList.remove(...greenClasses, ...redClasses, "hidden");
      const checkIcon = parentLabel.querySelector(".check-icon");
      if (checkIcon) checkIcon.classList.add("opacity-0");
    });
  });
  clearQuickQuestionsBtn.classList.add("hidden");
});

handleRadioStyling();
handleCheckboxStyling();

document.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash;
  if (hash.includes("?job=")) {
    const urlParams = new URLSearchParams(hash.substring(hash.indexOf("?")));
    const jobTitle = urlParams.get("job");

    if (jobTitle) {
      const decodedJobTitle = decodeURIComponent(jobTitle.replace(/\+/g, " "));
      const checkbox = document.querySelector(
        `input[name="positions"][value="${decodedJobTitle}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change"));

        document
          .getElementById("application-form")
          .scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  document
    .querySelectorAll("input[required], select[required]")
    .forEach((el) => {
      el.addEventListener("input", () => checkFieldValidity(el));
      el.addEventListener("change", () => checkFieldValidity(el));
    });
});

function checkFieldValidity(el) {
  const parent = el.closest(".relative");
  if (!parent) return true;

  const successIcon = parent.querySelector(".success-icon");
  const errorIcon = parent.querySelector(".error-icon");
  let isValid = true;

  if (!el.value || el.value.trim() === "") {
    isValid = false;
  } else if (
    el.id === "email" &&
    !el.value.toLowerCase().endsWith("@gmail.com")
  ) {
    isValid = false;
  }

  if (isValid) {
    el.classList.remove("border-red-500", "dark:border-red-500");
    el.classList.add("border-green-500", "dark:border-green-500");
    if (successIcon) successIcon.classList.remove("hidden");
    if (errorIcon) errorIcon.classList.add("hidden");
  } else {
    el.classList.add("border-red-500", "dark:border-red-500");
    el.classList.remove("border-green-500", "dark:border-green-500");
    if (successIcon) successIcon.classList.add("hidden");
    if (errorIcon) errorIcon.classList.remove("hidden");
  }
  return isValid;
}
