// src/Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import "./Dashboard.css";
import Chatbox from "./Chatbox";
import axios from "axios";

console.log("Dashboard connected to backend APIs");

// ==============================
// Dashboard Component
// ==============================
export default function Dashboard() {
  // ---------- UI / Modal State ----------
  const [profileOpen, setProfileOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isImageOpen, setImageOpen] = useState(false);
  const [isWeatherOpen, setWeatherOpen] = useState(false);
 const [isVoiceOpen, setVoiceOpen] = useState(false);
  const [isCropCalendarOpen, setCropCalendarOpen] = useState(false);
  const [isMarketOpen, setMarketOpen] = useState(false);
  const [isCommunityOpen, setCommunityOpen] = useState(false);
  const [isLearningOpen, setLearningOpen] = useState(false);
  const [isRewardsOpen, setRewardsOpen] = useState(false);

  // ---------- Profile / Logout ----------
  useEffect(() => {
    function onDocClick(e) {
      const profileBtn = document.getElementById("profileBtn");
      const popup = document.getElementById("profilePopup");
      if (!profileBtn || !popup) return;
      if (!profileBtn.contains(e.target) && !popup.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function handleLogout(e) {
    e.preventDefault();
    alert("You have been logged out!");
  }

  // =====================================================
  // WEATHER (real backend API)
  // =====================================================
  const [locationInput, setLocationInput] = useState("");
  const [weatherDisplayData, setWeatherDisplayData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [activeWeatherTab, setActiveWeatherTab] = useState("current");

  async function loadWeatherData(location = "Ghaziabad") {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/weather", {
        params: { lat: 10.85, lon: 76.27 }, // you can extend this with geolocation input
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWeatherDisplayData(res.data.weather);
    } catch (err) {
      console.error("Weather error:", err);
      setWeatherError("Failed to fetch weather.");
    } finally {
      setLoadingWeather(false);
    }
  }

  function openWeatherModal() {
    setWeatherOpen(true);
    loadWeatherData({location: "GHaziabad"});
  }
  function closeWeatherModal() {
    setWeatherOpen(false);
  }
 function searchLocation() {
    if (locationInput.trim()) {
      loadWeather({ location: locationInput.trim() });
    }
  }

  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          loadWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => alert("Unable to get your location. Please search manually.")
      );
    } else {
      alert("Geolocation not supported in this browser.");
    }
  }
  // =====================================================
  // IMAGE DIAGNOSE (real backend API)
  // =====================================================
  const fileInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const cameraCanvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [file, setFile] = useState(null);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
  const [diagnoseResult, setDiagnoseResult] = useState(null);
  const [diagnoseLoading, setDiagnoseLoading] = useState(false);
  const [diagnoseError, setDiagnoseError] = useState(null);
  const [ocrText, setOcrText] = useState("Processing image...");
  const [showUploadOptions, setShowUploadOptions] = useState(true);
  const [showCameraSection, setShowCameraSection] = useState(false);
  const [showImagePreviewSection, setShowImagePreviewSection] = useState(false);
  const [showImageResponseSection, setShowImageResponseSection] = useState(false);
  function openImageModal() {
    setImageOpen(true);
    resetImageUpload();
  }
  function closeImageModal() {
    setImageOpen(false);
  }

  async function uploadDiagnose() {
    if (!file) return;
    setDiagnoseLoading(true);
    setDiagnoseError(null);
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await axios.post(
        "http://localhost:5000/api/image/diagnose",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDiagnoseResult(res.data.diagnosis);
    } catch (err) {
      console.error("Diagnose error:", err);
      setDiagnoseError("Diagnosis failed. Try again.");
    } finally {
      setDiagnoseLoading(false);
    }
  }

  // async function openCamera() {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     cameraVideoRef.current.srcObject = stream;
  //     setCameraStream(stream);
  //   } catch {
  //     alert("Unable to access camera.");
  //   }
  // }

  //  async function openCamera() {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     cameraVideoRef.current.srcObject = stream;
  //     setCameraStream(stream);
  //     setShowCameraSection(true);
  //     setShowUploadOptions(false);
  //   } catch (err) {
  //     console.error("Error accessing camera:", err);
  //     alert("Unable to access camera. Please check permissions or try file upload.");
  //   }
  // } 

  async function openCamera() {
  try {
    // show the camera UI first so <video> is mounted
    setShowCameraSection(true);
    setShowUploadOptions(false);

    // wait for React to render <video>, then request camera
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          setCameraStream(stream);
        } else {
          console.error("cameraVideoRef not ready yet");
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Unable to access camera. Please check permissions or try file upload.");
      }
    }, 100); // small delay (100ms) ensures <video> exists
  } catch (err) {
    console.error("Unexpected error in openCamera:", err);
  }
}


  function closeCameraSection() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setShowCameraSection(false);
    setShowUploadOptions(true);
  }

  function captureImage() {
    const video = cameraVideoRef.current;
    const canvas = cameraCanvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const capturedFile = new File([blob], "camera-capture.jpg", {
        type: "image/jpeg",
      });
      handleFile(capturedFile);
    });
    stopCamera();
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  }

  function handleFile(selectedFile) {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreviewSrc(ev.target.result);
      setDiagnoseResult(null);
      setDiagnoseError(null);
    };
    reader.readAsDataURL(selectedFile);
  }

  function resetImageUpload() {
    setFile(null);
    setImagePreviewSrc(null);
    setDiagnoseResult(null);
    setDiagnoseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    stopCamera();
  }
// function resetImageUpload() {
//     setShowUploadOptions(true);
//     setShowCameraSection(false);
//     setShowImagePreviewSection(false);
//     setShowImageResponseSection(false);
//     setOcrText("Processing image...");
//     setImagePreviewSrc(null);
//     setImageAnalysis(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     if (cameraStream) {
//       cameraStream.getTracks().forEach((t) => t.stop());
//       setCameraStream(null);
//     }
//   }
function resetImageUpload() {
  setShowUploadOptions(true);
  setShowCameraSection(false);
  setShowImagePreviewSection(false);
  setShowImageResponseSection(false);
  setOcrText("Processing image...");
  setImagePreviewSrc(null);
  setDiagnoseResult(null);   // instead of setImageAnalysis
  setDiagnoseError(null);
  if (fileInputRef.current) fileInputRef.current.value = "";
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
  }
}


  // =====================================================
  // CHAT (kept as in your existing code - simulated/Chatbox component)
  // =====================================================
  // function openChatModal() {
  //   setChatOpen(true);
  // }
  function openChatModal(mode = "text") {
    if (mode === "audio") {
      openVoiceModal();
      return;
    }
    setChatOpen(true);
    setShowExamples(!hasStartedChat);
    // load history from storage (already in state)
  }
  function closeChatModal() {
    setChatOpen(false);
  }
// ==================================================
 // ---------- Voice Modal (simulation) ----------
  // const [isRecording, setIsRecording] = useState(false);
  // const [voiceText, setVoiceText] = useState("");
  // const [voiceResponse, setVoiceResponse] = useState(null);

  // function openVoiceModal() {
  //   setVoiceOpen(true);
  // }
  // function closeVoiceModal() {
  //   setVoiceOpen(false);
  // }

  // function toggleRecording() {
  //   if (!isRecording) {
  //     setIsRecording(true);
  //     setVoiceText("Listening...");
  //     setTimeout(() => {
  //       setVoiceText("I want to know best fertilizer for rice");
  //       // simulate sending
  //       const question = "I want to know best fertilizer for rice";
  //       setVoiceResponse("Processing...");
  //       setTimeout(() => {
  //         const resp = generateFarmingResponse(question);
  //         setVoiceResponse(resp);
  //         saveChatHistory(question, resp);
  //       }, 1400);
  //     }, 1400);
  //   } else {
  //     setIsRecording(false);
  //     setVoiceText("Tap to speak");
  //   }
  // }
  
// function generateFarmingResponse(query) {
//   // Placeholder: replace with your AI backend call later
//   if (query.toLowerCase().includes("fertilizer")) {
//     return "Use 120:60:40 NPK per hectare for rice.";
//   }
//   return "I don’t have a specific answer, but please consult an agronomist.";
// }

// function saveChatHistory(question, answer) {
//   console.log("Saved chat:", { question, answer });
// }

  // ---------- Voice Modal (simulation) ----------
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceResponse, setVoiceResponse] = useState(null);

  function openVoiceModal() {
    setVoiceOpen(true);
  }
  function closeVoiceModal() {
    setVoiceOpen(false);
  }

  function toggleRecording() {
    if (!isRecording) {
      setIsRecording(true);
      setVoiceText("Listening...");
      setTimeout(() => {
        setVoiceText("I want to know best fertilizer for rice");
        // simulate sending
        const question = "I want to know best fertilizer for rice";
        setVoiceResponse("Processing...");
        setTimeout(() => {
          const resp = generateFarmingResponse(question);
          setVoiceResponse(resp);
          saveChatHistory(question, resp);
        }, 1400);
      }, 1400);
    } else {
      setIsRecording(false);
      setVoiceText("Tap to speak");
    }
  }


  // ---------- Crop Calendar ----------
  // We'll port essential cropData from your JS (rice + tomato etc.)
  const cropData = {
    rice: {
      name: "Rice (धान)",
      type: "Cereal",
      duration: "120-150 days",
      seasons: ["kharif", "rabi"],
      regions: ["all"],
      overview: {
        description: "Rice is the staple food crop of India, grown in diverse agro-climatic conditions.",
        varieties: ["Basmati", "Non-Basmati", "Aromatic", "Fine grain", "Medium grain", "Coarse grain"],
        soilType: "Clay loam, silty clay loam with pH 5.5-7.0",
        climate: "Tropical and subtropical with 20-35°C temperature",
        rainfall: "1000-2000mm annually",
      },
      cultivation: {
        landPrep: "Deep plowing, puddling, leveling for water retention",
        seedRate: "20-25 kg/hectare for transplanting, 60-80 kg/hectare for direct seeding",
        spacing: "20cm x 15cm for transplanting",
        fertilizer: "120:60:40 NPK kg/hectare",
        irrigation: "Continuous flooding during vegetative stage, intermittent during reproductive stage",
      },
      timeline: {
        kharif: [
          { stage: "Land Preparation", period: "May-June", icon: "🚜", details: "Deep plowing, puddling, leveling. Apply FYM 10-12 tons/hectare." },
          { stage: "Nursery Preparation", period: "June", icon: "🌱", details: "Prepare nursery beds, sow seeds. Maintain 2-3cm water level." },
          { stage: "Transplanting", period: "July", icon: "🌾", details: "Transplant 25-30 day old seedlings. Maintain proper spacing." },
          { stage: "Vegetative Growth", period: "July-August", icon: "🌿", details: "Apply nitrogen fertilizer. Maintain water level 2-5cm." },
          { stage: "Reproductive Phase", period: "September", icon: "🌸", details: "Panicle initiation. Apply potash fertilizer. Control pests." },
          { stage: "Grain Filling", period: "October", icon: "🌾", details: "Intermittent irrigation. Monitor for diseases." },
          { stage: "Maturity & Harvest", period: "November", icon: "🚛", details: "Harvest when 80% grains turn golden. Proper drying essential." },
        ],
        rabi: [
          { stage: "Land Preparation", period: "October-November", icon: "🚜", details: "Prepare fields after kharif harvest. Level properly." },
          { stage: "Sowing", period: "November-December", icon: "🌱", details: "Direct seeding or transplanting. Use short duration varieties." },
          { stage: "Vegetative Growth", period: "December-January", icon: "🌿", details: "Regular irrigation. Apply nitrogen in splits." },
          { stage: "Reproductive Phase", period: "February", icon: "🌸", details: "Flowering stage. Ensure adequate water supply." },
          { stage: "Grain Filling", period: "March", icon: "🌾", details: "Grain development. Reduce irrigation frequency." },
          { stage: "Harvest", period: "April", icon: "🚛", details: "Harvest before summer heat. Proper storage important." },
        ],
      },
      diseases: [
        { name: "Rust (Yellow, Brown, Black)", symptoms: "Rust colored pustules", control: "Resistant varieties, fungicide spray" },
        { name: "Powdery Mildew", symptoms: "White powdery growth", control: "Sulfur dusting, systemic fungicides" },
      ],
      pests: [{ name: "Aphids", symptoms: "Yellowing, stunted growth", control: "Insecticidal soap, predatory insects" }],
      market: { msp: "₹2,275/quintal (2024-25)", avgPrice: "₹2,400-2,800/quintal", demand: "High domestic demand", storage: "Moisture content below 12%, pest-free storage" },
    },
    tomato: {
      name: "Tomato (टमाटर)",
      type: "Vegetable",
      duration: "90-120 days",
      seasons: ["kharif", "rabi", "zaid"],
      regions: ["all"],
      overview: {
        description: "Tomato is one of the most important vegetable crops grown worldwide.",
        varieties: ["Determinate", "Indeterminate", "Cherry", "Hybrid"],
        soilType: "Well-drained sandy loam with pH 6.0-7.0",
        climate: "Warm season crop, temperature 20-25°C optimal",
        rainfall: "600-750mm annually",
      },
      cultivation: {
        landPrep: "Deep plowing, raised beds for drainage",
        seedRate: "300-400g/hectare",
        spacing: "60cm x 45cm",
        fertilizer: "120:80:50 NPK kg/hectare",
        irrigation: "Drip irrigation preferred, avoid water stress",
      },
      timeline: {
        rabi: [
          { stage: "Nursery Preparation", period: "September", icon: "🌱", details: "Prepare nursery beds, sow seeds in pro-trays." },
          { stage: "Land Preparation", period: "October", icon: "🚜", details: "Prepare raised beds, install drip irrigation." },
          { stage: "Transplanting", period: "October-November", icon: "🌿", details: "Transplant 4-5 week old seedlings." },
          { stage: "Vegetative Growth", period: "November-December", icon: "🌿", details: "Regular irrigation, apply nitrogen fertilizer." },
          { stage: "Flowering", period: "December-January", icon: "🌸", details: "Support plants with stakes. Apply phosphorus." },
          { stage: "Fruit Development", period: "January-February", icon: "🍅", details: "Regular harvesting begins. Apply potash." },
          { stage: "Peak Harvest", period: "February-March", icon: "🚛", details: "Daily harvesting. Proper post-harvest handling." },
        ],
      },
      diseases: [{ name: "Early Blight", symptoms: "Dark spots with concentric rings", control: "Fungicide spray, crop rotation" }],
      pests: [{ name: "Fruit Borer", symptoms: "Holes in fruits", control: "Pheromone traps, Bt spray" }],
      market: { msp: "Not applicable", avgPrice: "₹1,500-4,000/quintal (seasonal)", demand: "High demand year-round", storage: "Short shelf life" },
    },
  };

  // Crop calendar UI specific state
  const [selectedCropKey, setSelectedCropKey] = useState("rice");
  const [selectedSeason, setSelectedSeason] = useState("kharif");
  const [selectedRegion, setSelectedRegion] = useState("south");
  const [timelineHtml, setTimelineHtml] = useState("");
  const [cropOverviewHtml, setCropOverviewHtml] = useState("");
  const [cultivationHtml, setCultivationHtml] = useState("");
  const [diseasesHtml, setDiseasesHtml] = useState("");
  const [marketInfoHtml, setMarketInfoHtml] = useState("");
  const [seasonTipsHtml, setSeasonTipsHtml] = useState("");

  function openCropCalendarModal() {
    setCropCalendarOpen(true);
    // init with current selections
    updateCropCalendar(selectedCropKey, selectedSeason, selectedRegion);
  }
  function closeCropCalendarModal() {
    setCropCalendarOpen(false);
  }
// ==============================
// WEATHER (real backend API + UI like code2)
// ==============================
// const [locationInput, setLocationInput] = useState("");
// const [weatherDisplayData, setWeatherDisplayData] = useState(null);
// const [loadingWeather, setLoadingWeather] = useState(false);
// const [weatherError, setWeatherError] = useState(null);
// const [activeWeatherTab, setActiveWeatherTab] = useState("current");

// async function loadWeatherByCoords(lat, lon) {
//   setLoadingWeather(true);
//   setWeatherError(null);
//   try {
//     const res = await axios.get("http://localhost:5000/api/weather", {
//       params: { lat, lon },
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     });
//     setWeatherDisplayData(res.data.weather);
//   } catch (err) {
//     console.error("Weather error:", err);
//     setWeatherError("Failed to fetch weather.");
//   } finally {
//     setLoadingWeather(false);
//   }
// }

// async function loadWeatherByLocation(location = "Palakkad") {
//   setLoadingWeather(true);
//   setWeatherError(null);
//   try {
//     const res = await axios.get("http://localhost:5000/api/weather", {
//       params: { location },
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     });
//     setWeatherDisplayData(res.data.weather);
//   } catch (err) {
//     console.error("Weather error:", err);
//     setWeatherError("Failed to fetch weather.");
//   } finally {
//     setLoadingWeather(false);
//   }
// }

// function openWeatherModal() {
//   setWeatherOpen(true);
//   loadWeatherByLocation("Palakkad"); // default
// }

// function closeWeatherModal() {
//   setWeatherOpen(false);
// }

// function searchLocation() {
//   if (locationInput.trim()) {
//     loadWeatherByLocation(locationInput.trim());
//   }
// }

// function getCurrentLocation() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => loadWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
//       () => alert("Unable to get your location. Please search manually.")
//     );
//   } else {
//     alert("Geolocation not supported in this browser.");
//   }
// }

  function updateCropCalendar(cropKey = selectedCropKey, season = selectedSeason, region = selectedRegion) {
    const data = cropData[cropKey];
    if (!data) return;
    const seasonName = season.charAt(0).toUpperCase() + season.slice(1);
    // timeline
    const timelineArr = data.timeline?.[season] || data.timeline?.kharif || [];
    setTimelineHtml(
      timelineArr
        .map(
          (stage) =>
            `<div class="timeline-item"><div class="timeline-icon">${stage.icon}</div><div class="timeline-content"><h5>${stage.stage}</h5><div class="timeline-period">${stage.period}</div><p>${stage.details}</p></div></div>`
        )
        .join("")
    );
    // overview
    setCropOverviewHtml(`
      <div class="overview-grid">
        <div class="overview-item"><h5>Description</h5><p>${data.overview.description}</p></div>
        <div class="overview-item"><h5>Duration</h5><p>${data.duration}</p></div>
        <div class="overview-item"><h5>Soil Type</h5><p>${data.overview.soilType}</p></div>
        <div class="overview-item"><h5>Climate</h5><p>${data.overview.climate}</p></div>
        <div class="overview-item"><h5>Rainfall</h5><p>${data.overview.rainfall}</p></div>
        <div class="overview-item"><h5>Varieties</h5><ul>${(data.overview.varieties || []).map((v) => `<li>${v}</li>`).join("")}</ul></div>
      </div>
    `);
    // cultivation
    setCultivationHtml(`
      <div class="cultivation-grid">
        <div class="cultivation-item"><h5>Land Preparation</h5><p>${data.cultivation?.landPrep || ""}</p></div>
        <div class="cultivation-item"><h5>Seed Rate</h5><p>${data.cultivation?.seedRate || ""}</p></div>
        <div class="cultivation-item"><h5>Spacing</h5><p>${data.cultivation?.spacing || ""}</p></div>
        <div class="cultivation-item"><h5>Fertilizer</h5><p>${data.cultivation?.fertilizer || ""}</p></div>
        <div class="cultivation-item"><h5>Irrigation</h5><p>${data.cultivation?.irrigation || ""}</p></div>
      </div>
    `);
    // diseases
    setDiseasesHtml(`
      <div class="diseases-section">
        ${(data.diseases || []).map(d => `<div class="disease-item"><h5>${d.name}</h5><p><strong>Symptoms:</strong> ${d.symptoms}</p><p><strong>Control:</strong> ${d.control}</p></div>`).join("")}
      </div>
    `);
    // market info
    setMarketInfoHtml(`
      <div class="market-grid">
        <div class="market-item"><h5>Current Price Range</h5><p>${data.market?.avgPrice || "N/A"}</p></div>
        <div class="market-item"><h5>MSP</h5><p>${data.market?.msp || "N/A"}</p></div>
        <div class="market-item"><h5>Demand</h5><p>${data.market?.demand || "N/A"}</p></div>
        <div class="market-item"><h5>Storage</h5><p>${data.market?.storage || "N/A"}</p></div>
      </div>
    `);
    // season tips
    setSeasonTipsHtml(`
      <div class="tips-grid">
        <div class="tip-card">Monitor soil moisture and avoid water stress.</div>
        <div class="tip-card">Use certified seeds for better germination.</div>
        <div class="tip-card">Apply fertilizer based on soil test recommendations.</div>
      </div>
    `);
  }

  // ---------- Market (placeholder) ----------
  const [marketLocation, setMarketLocation] = useState("palakkad");
  const [marketFilter, setMarketFilter] = useState("all");
  const [marketTimeFilter, setMarketTimeFilter] = useState("today");
  const [priceTableBodyHtml, setPriceTableBodyHtml] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const PAGE_SIZE = 8;
  const mockMarketData = [
    { crop: "Rice", price: "₹2,500", change: "+2%", min: "₹2,200", max: "₹2,700", volume: "1200 qt" },
    { crop: "Wheat", price: "₹2,800", change: "-1%", min: "₹2,600", max: "₹2,950", volume: "800 qt" },
    { crop: "Tomato", price: "₹3,200", change: "+5%", min: "₹2,900", max: "₹3,500", volume: "500 qt" },
    { crop: "Potato", price: "₹1,200", change: "+0.5%", min: "₹1,100", max: "₹1,300", volume: "300 qt" },
    { crop: "Onion", price: "₹2,100", change: "-0.8%", min: "₹2,000", max: "₹2,300", volume: "400 qt" },
    { crop: "Cotton", price: "₹45,000", change: "+1%", min: "₹43,000", max: "₹46,000", volume: "60 kg" },
    { crop: "Chili", price: "₹9,000", change: "+2%", min: "₹8,500", max: "₹9,200", volume: "70 kg" },
    { crop: "Maize", price: "₹2,100", change: "0%", min: "₹2,000", max: "₹2,300", volume: "600 qt" },
    // ... more rows to paginate
  ];

  function updateMarketTable() {
    const start = (pageNum - 1) * PAGE_SIZE;
    const page = mockMarketData.slice(start, start + PAGE_SIZE);
    setPriceTableBodyHtml(
      page
        .map(
          (r, i) =>
            `<tr>
              <td>${r.crop}</td>
              <td>${r.price}</td>
              <td>${r.change}</td>
              <td>${r.min}</td>
              <td>${r.max}</td>
              <td>${r.volume}</td>
              <td><button class="btn" onclick="alert('View ${r.crop}')">View</button></td>
            </tr>`
        )
        .join("")
    );
  }

  useEffect(() => {
    updateMarketTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  function previousPage() {
    setPageNum((p) => Math.max(1, p - 1));
  }
  function nextPage() {
    const max = Math.ceil(mockMarketData.length / PAGE_SIZE);
    setPageNum((p) => Math.min(max, p + 1));
  }

  function refreshMarketData() {
    // simulate refresh
    alert("Market data refreshed (simulated).");
    updateMarketTable();
  }

  function searchMarketData() {
    // simple local filter (simulate)
    const q = document.getElementById("marketSearch")?.value?.toLowerCase() || "";
    const filtered =
      q.length > 0 ? mockMarketData.filter((m) => m.crop.toLowerCase().includes(q)) : mockMarketData;
    setPriceTableBodyHtml(
      filtered
        .slice(0, PAGE_SIZE)
        .map(
          (r) =>
            `<tr>
              <td>${r.crop}</td>
              <td>${r.price}</td>
              <td>${r.change}</td>
              <td>${r.min}</td>
              <td>${r.max}</td>
              <td>${r.volume}</td>
              <td><button class="btn" onclick="alert('View ${r.crop}')">View</button></td>
            </tr>`
        )
        .join("")
    );
  }

  // ---------- Community Forum ----------
  const [forumPosts, setForumPosts] = useState([
    { title: "Best fertilizer for wheat?", content: "Looking for suggestions!", category: "Advice", id: Date.now() - 10000 },
  ]);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("General");

  function openCommunityModal() {
    setCommunityOpen(true);
  }
  function closeCommunityModal() {
    setCommunityOpen(false);
  }

  function addForumPost() {
    if (!postTitle.trim() || !postContent.trim()) {
      alert("Please enter title and content.");
      return;
    }
    const item = { title: postTitle, content: postContent, category: postCategory, id: Date.now() };
    setForumPosts((prev) => [item, ...prev]);
    setPostTitle("");
    setPostContent("");
    setPostCategory("General");
  }

  // ---------- Learning Hub & Rewards (placeholders) ----------
  function openLearningHub() {
    setLearningOpen(true);
  }
  function openRewardsPopup() {
    setRewardsOpen(true);
  }

  // ---------- Misc helpers for injecting HTML into preserved sections ----------
  useEffect(() => {
    // timeline container
    const timelineContainer = document.getElementById("timelineContainer");
    if (timelineContainer) timelineContainer.innerHTML = timelineHtml;
    const cropOverview = document.getElementById("cropOverview");
    if (cropOverview) cropOverview.innerHTML = cropOverviewHtml;
    const cultivationInfo = document.getElementById("cultivationInfo");
    if (cultivationInfo) cultivationInfo.innerHTML = cultivationHtml;
    const diseasesInfo = document.getElementById("diseasesInfo");
    if (diseasesInfo) diseasesInfo.innerHTML = diseasesHtml;
    const marketInfo = document.getElementById("marketInfo");
    if (marketInfo) marketInfo.innerHTML = marketInfoHtml;
    const seasonTips = document.getElementById("seasonTips");
    if (seasonTips) seasonTips.innerHTML = seasonTipsHtml;

    // price table body
    const priceTableBody = document.getElementById("priceTableBody");
    if (priceTableBody) priceTableBody.innerHTML = priceTableBodyHtml;
    // page info
    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) {
      const max = Math.ceil(mockMarketData.length / PAGE_SIZE) || 1;
      pageInfo.textContent = `Page ${pageNum} of ${max}`;
    }
  }, [timelineHtml, cropOverviewHtml, cultivationHtml, diseasesHtml, marketInfoHtml, seasonTipsHtml, priceTableBodyHtml, pageNum]);

  // ---------- Initialization ----------
  useEffect(() => {
    // initial crop calendar data
    updateCropCalendar();
  }, []); // eslint-disable-line


  // =====================================================
  // MAIN UI RENDER
  // =====================================================
  return (
    
    <div >
      <header className="header">
        <div className="left-section">
          <img src="/logo.png" alt="Farm Assist Logo" className="logo" />
          <span className="welcome">Hello, <strong id="userName">Krish Gupta</strong></span>
          <span className="location"><i className="fas fa-map-marker-alt"></i> <span id="userLocation">Ghaziabad</span></span>
        </div>

        <div className="right-section">
          <div className="profile-container">
            <img
              src="/profile.png"
              alt="Profile"
              className="profile-pic"
              id="profileBtn"
              onClick={() => setProfileOpen((p) => !p)}
            />
            <div className="profile-popup" id="profilePopup" style={{ display: profileOpen ? "block" : "none" }}>
              <p><strong>Name:</strong> Ramu</p>
              <p><strong>Queries Asked:</strong> 5</p>
              <p><strong>Points Earned:</strong> 120</p>
              <p><strong>Crop:</strong> Wheat</p>
            </div>
          </div>
          <a href="land.html" className="logout-btn" onClick={handleLogout}>Logout</a>
        </div>
      </header>

{/* wavy sec */}
{/* Wavy / Hero */}
      <section className="wavy-section">
        <div className="wavy-bg">
          <div className="wavy-content">
            <div className="wavy-text">
              <h1>AI That Speaks Farmer</h1>
              <p>Ask any question about your crops, pests, weather, or farm care, and get instant advice from our smart AI assistant</p>
            </div>
            <div className="wavy-image"></div>
          </div>
        </div>
      </section>
{/* *********************** */}
{/* Cards Section */}
      <section className="cards-section">
        <div className="card">
          <i className="fas fa-keyboard fa-3x card-icon"></i>
          <p>Type your question to get instant advice</p>
          <button onClick={() => setChatOpen(true)}>Type Query</button>
        </div>

         {/* <div className="card">
          <i className="fas fa-microphone fa-3x card-icon"></i>
          <p>Speak your query to get instant advice</p>
          <button onClick={openVoiceModal}>Record Voice Query</button>
        </div> */}
 <div className="card">
          <i className="fas fa-microphone fa-3x card-icon"></i>
          <p>Speak your query to get instant advice</p>
          <button onClick={() => openChatModal("audio")}>Record Voice Query</button>
        </div>
        <div className="card">
          <i className="fas fa-image fa-3x card-icon"></i>
          <p>Upload an image to get instant analysis</p>
          <button onClick={openImageModal}>Upload Image</button>
        </div>
      </section>


      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">
          🌾
           Farmer Dashboard
        </h1>
        <button
          onClick={() => setChatOpen(true)}
          className=""
        >
          💬 Ask AI
        </button>
      </div> */}

{/* Grid features */}
      <div className="container">
        <section className="cards-grid">
          <div className="card" onClick={openCropCalendarModal}><h3>Crop Calendar</h3><p>Track sowing, irrigation, and harvest schedules.</p></div>

          <button className="card" onClick={openWeatherModal}>{loadingWeather ? "Loading..." : "Get Weather"}<h3>Weather Alerts</h3><p>Stay updated with real-time weather conditions for your region.</p></button>
           {weatherError && <p className="text-red-600 mt-2">{weatherError}</p>}
          {weatherDisplayData && (
            <div className="mt-3">
              <p>Temp: {weatherDisplayData.temperature}°C</p>
              <p>Humidity: {weatherDisplayData.humidity}%</p>
              <p>{weatherDisplayData.description}</p>
              <p className="text-xs text-gray-500">
                Provider: {weatherDisplayData.provider}
              </p>
            </div>
          )}
          {isWeatherOpen && (
  <div className="modal-overlay">
    <div className="modal weather-modal">
      <div className="modal-header">
        <h2>🌦 Weather</h2>
        <button className="close-btn" onClick={closeWeatherModal}>✖</button>
      </div>

{/* Voice Modal */}
      {isVoiceOpen && (
        <div id="voiceModal" className="modal" style={{ display: "block" }}>
          <div className="modal-content voice-modal">
            <div className="voice-header"><h3>Voice Query</h3><span className="close" onClick={closeVoiceModal}>&times;</span></div>
            <div className="voice-container">
              <div className="language-selector"><span>English</span></div>
              <div className="voice-interface">
                <div className="mic-container">
                  <button className="mic-button" id="micButton" onClick={toggleRecording}><i className="fas fa-microphone" id="micIcon"></i></button>
                  <div className="recording-status" id="recordingStatus">{isRecording ? "Listening..." : "Tap to speak"}</div>
                </div>
                <div className="voice-text-display" id="voiceTextDisplay"><p>{voiceText || "Your speech will appear here..."}</p></div>
                {voiceResponse && <div className="voice-response" id="voiceResponse"><h4>Response:</h4><div className="response-content" id="responseContent">{voiceResponse}</div></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="modal-content">
        {/* Search & Location Controls */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Enter location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="flex-1 px-2 py-1 border rounded-md"
          />
          <button
            onClick={searchLocation}
            className="px-3 py-1 bg-green-600 text-white rounded-md"
          >
            Search
          </button>
          <button
            onClick={getCurrentLocation}
            className="px-3 py-1 bg-blue-600 text-white rounded-md"
          >
            📍 Current
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveWeatherTab("current")}
            className={`px-3 py-1 rounded-md ${
              activeWeatherTab === "current"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setActiveWeatherTab("forecast")}
            className={`px-3 py-1 rounded-md ${
              activeWeatherTab === "forecast"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Forecast
          </button>
        </div>

        {/* Loading & Error */}
        {loadingWeather && <p>Loading...</p>}
        {weatherError && <p className="text-red-500">{weatherError}</p>}

        {/* Weather Data */}
        {weatherDisplayData && (
          <div>
            {activeWeatherTab === "current" && (
              <div>
                <p>🌍 Location: {weatherDisplayData.location}</p>
                <p>🌡 Temp: {weatherDisplayData.temperature}°C</p>
                <p>💧 Humidity: {weatherDisplayData.humidity}%</p>
                <p>🌤 {weatherDisplayData.description}</p>
                <p className="text-xs text-gray-500">
                  Provider: {weatherDisplayData.provider}
                </p>
              </div>
            )}

            {activeWeatherTab === "forecast" && weatherDisplayData.forecast && (
              <div className="grid grid-cols-2 gap-2">
                {weatherDisplayData.forecast.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-2 border rounded-md bg-gray-50 text-center"
                  >
                    <p>{f.day}</p>
                    <p>{f.icon}</p>
                    <p>{f.high}° / {f.low}°</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}

          <div className="card" onClick={() => setMarketOpen(true)}><h3>Market Updates</h3><p>Check current crop prices and trends at local markets.</p></div>
          <div className="card" onClick={openCommunityModal}><h3>Community Forum</h3><p>Connect and discuss with other farmers.</p></div>

          <div className="card row2" onClick={openLearningHub}><h3>Learning Hub</h3><p>Watch videos and take quizzes to improve skills.</p></div>
          <div className="card row2" onClick={openRewardsPopup}><h3>Rewards & Coins</h3><p>Earn points, badges, and climb the leaderboard by completing farming tasks.</p></div>
          <div className="card row2"><h3>Officer Escalation</h3><p>Send complex queries directly to local agricultural officers for expert guidance.</p></div>
        </section>
      </div>


      {/* ---------- GRID CONTENT ---------- */}
      {/* <div className="grid md:grid-cols-2 gap-6">
        {/* WEATHER */}
        {/* <div className="p-4 bg-white rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">🌦 Weather</h2>
          <button
            onClick={openWeatherModal}
            className="px-3 py-1 bg-green-600 text-white rounded-md"
          >
            {loadingWeather ? "Loading..." : "Get Weather"}
          </button>
          {weatherError && <p className="text-red-600 mt-2">{weatherError}</p>}
          {weatherDisplayData && (
            <div className="mt-3">
              <p>Temp: {weatherDisplayData.temperature}°C</p>
              <p>Humidity: {weatherDisplayData.humidity}%</p>
              <p>{weatherDisplayData.description}</p>
              <p className="text-xs text-gray-500">
                Provider: {weatherDisplayData.provider}
              </p>
            </div>
          )}
        </div> */} 

        {/* IMAGE DIAGNOSE */}
        <div className="p-4 bg-white rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">🌱 Diagnose Crop</h2>
          <button
            onClick={openImageModal}
            className="px-3 py-1 bg-green-600 text-white rounded-md"
          >
            Upload Image
          </button>
        </div>
      {/* </div> */}

      // {/* ---------- IMAGE MODAL ---------- */}
      {isImageOpen && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-content image-modal">
            <div className="image-header">
              <h2>Upload Image for Analysis</h2>
              <span className="close" onClick={closeImageModal}>
                &times;
              </span>
            </div>

            <div className="image-container">
              {!file && !cameraStream && (
                <div className="upload-options">
                  <div className="upload-option" onClick={openCamera}>
                    <i className="fas fa-camera fa-2x"></i>
                    <h4>Camera</h4>
                    <p>Take a photo with your camera</p>
                  </div>
                  <div
                    className="upload-option"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i className="fas fa-upload fa-2x"></i>
                    <h4>Upload File</h4>
                    <p>Choose image from your device</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              )}

              {showCameraSection && (
                <div className="camera-section">
                  <video ref={cameraVideoRef} autoPlay id="cameraVideo"></video>
                  <div className="camera-controls">
                    <button className="capture-btn" onClick={captureImage}>
                      Capture
                    </button>
                    <button className="cancel-btn" onClick={stopCamera}>
                      Cancel
                    </button>
                  </div>
                  <canvas ref={cameraCanvasRef} style={{ display: "none" }}></canvas>
                </div>
              )}

              {file && (
                <div className="image-preview-section">
                  <div className="image-preview">
                    <img src={imagePreviewSrc} alt="Preview" />
                    <div className="ocr-actions">
                      <button
                        className="process-btn"
                        onClick={uploadDiagnose}
                        disabled={diagnoseLoading}
                      >
                        {diagnoseLoading ? "Analyzing..." : "Analyze"}
                      </button>
                      <button className="reset-btn" onClick={resetImageUpload}>
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="ocr-results">
                    <h4>Result</h4>
                    {diagnoseError && <p style={{ color: "red" }}>{diagnoseError}</p>}
                    {diagnoseResult && (
                      <div className="image-response">
                        {diagnoseResult.disease === "Uncertain" ? (
                          <>
                            <h3>⚠️ Diagnosis Uncertain</h3>
                            <p>
                              The image may not be a plant, or the system wasn’t sure.
                            </p>
                            {diagnoseResult.rawAdvice && (
                              <p>{diagnoseResult.rawAdvice}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <h3>✅ Disease: {diagnoseResult.disease}</h3>
                            <p>
                              <strong>Problems:</strong>{" "}
                              {diagnoseResult.problems?.join(", ") || "N/A"}
                            </p>
                            <p>
                              <strong>Solutions:</strong>{" "}
                              {diagnoseResult.solutions?.join(", ") || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Provider: {diagnoseResult.provider}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- CHATBOX POPUP ---------- */}
      {isChatOpen && <Chatbox onClose={closeChatModal} />}
    </div>
  );
}
