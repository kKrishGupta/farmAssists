// // src/Dashboard.jsx
// import React, { useEffect, useRef, useState } from "react";
// import "./dashboard.css";

// /**
//  * Dashboard.jsx
//  * Full React conversion of your dashboard with:
//  * - OpenAI chat & image analysis (requires VITE_OPENAI_API_KEY)
//  * - OpenWeather integration for live weather (requires VITE_OPENWEATHER_API_KEY)
//  * - Market data fetch via VITE_MARKET_API_URL (optional). Falls back to mock data.
//  *
//  * Notes:
//  * - Place dashboard.css unchanged in src/
//  * - Place static assets (logo.png, profile.png) in /public
//  */

// export default function Dashboard() {
//   // ---------- UI / Modal State ----------
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [isChatOpen, setChatOpen] = useState(false);
//   const [isImageOpen, setImageOpen] = useState(false);
//   const [isWeatherOpen, setWeatherOpen] = useState(false);
//   const [isVoiceOpen, setVoiceOpen] = useState(false);
//   const [isCropCalendarOpen, setCropCalendarOpen] = useState(false);
//   const [isMarketOpen, setMarketOpen] = useState(false);
//   const [isCommunityOpen, setCommunityOpen] = useState(false);
//   const [isLearningOpen, setLearningOpen] = useState(false);
//   const [isRewardsOpen, setRewardsOpen] = useState(false);

//   // ---------- Profile / Logout ----------
//   useEffect(() => {
//     function onDocClick(e) {
//       const profileBtn = document.getElementById("profileBtn");
//       const popup = document.getElementById("profilePopup");
//       if (!profileBtn || !popup) return;
//       if (!profileBtn.contains(e.target) && !popup.contains(e.target)) {
//         setProfileOpen(false);
//       }
//     }
//     document.addEventListener("click", onDocClick);
//     return () => document.removeEventListener("click", onDocClick);
//   }, []);

//   function handleLogout(e) {
//     e.preventDefault();
//     alert("You have been logged out!");
//   }

//   // ---------- Chat ----------
//   const chatMessagesRef = useRef(null);
//   const [chatMessages, setChatMessages] = useState(() => [
//     { sender: "bot", text: "👋 Welcome to Farm Assist! How can I help you today?" },
//   ]);
//   const [chatInput, setChatInput] = useState("");
//   const [chatHistoryArray, setChatHistoryArray] = useState(() => {
//     try {
//       const raw = localStorage.getItem("farmAssistChatHistory");
//       return raw ? JSON.parse(raw) : [];
//     } catch {
//       return [];
//     }
//   });
//   const [isHistoryVisible, setIsHistoryVisible] = useState(false);

//   useEffect(() => {
//     // autoscroll chat
//     if (chatMessagesRef.current) {
//       chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
//     }
//   }, [chatMessages]);

//   // ---------- OpenAI Chat (production: uses your key from .env) ----------
//   async function callOpenAIChat(question) {
//     const key = import.meta.env.VITE_OPENAI_API_KEY;
//     if (!key) {
//       console.warn("OpenAI API key not provided. Falling back to fallback reply.");
//       return `Mock reply (OpenAI key missing): Suggestion for "${question}".`;
//     }

//     try {
//       const resp = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${key}`,
//         },
//         body: JSON.stringify({
//           model: "gpt-4o-mini", // use a cost-appropriate model; change as you like
//           messages: [
//             { role: "system", content: "You are Farm Assist — a helpful agronomy assistant for farmers. Reply concisely in simple language and include actionable steps." },
//             { role: "user", content: question },
//           ],
//           max_tokens: 400,
//           temperature: 0.2,
//         }),
//       });
//       const data = await resp.json();
//       if (data?.choices?.[0]?.message?.content) {
//         return data.choices[0].message.content.trim();
//       } else {
//         console.error("OpenAI chat response missing:", data);
//         return "Sorry — no response from the model right now.";
//       }
//     } catch (err) {
//       console.error("OpenAI chat error:", err);
//       return "Network error while contacting model. Try again later.";
//     }
//   }

//   function saveChatHistory(question, answer) {
//     const item = {
//       id: Date.now(),
//       question: question.length > 80 ? question.slice(0, 80) + "..." : question,
//       timestamp: new Date().toLocaleString(),
//       answer,
//     };
//     setChatHistoryArray((prev) => {
//       const next = [item, ...prev].slice(0, 50); // keep last 50
//       try {
//         localStorage.setItem("farmAssistChatHistory", JSON.stringify(next));
//       } catch {}
//       return next;
//     });
//   }

//   async function sendMessage() {
//     const q = chatInput.trim();
//     if (!q) return;
//     // add user message
//     setChatMessages((prev) => [...prev, { sender: "user", text: q }]);
//     setChatInput("");
//     // typing indicator
//     setChatMessages((prev) => [...prev, { sender: "bot", text: "⏳ Thinking..." }]);

//     const reply = await callOpenAIChat(q);

//     // replace typing indicator with actual reply
//     setChatMessages((prev) => {
//       const copy = [...prev];
//       // replace last bot message
//       let index = copy.length - 1;
//       if (index >= 0 && copy[index].sender === "bot" && copy[index].text === "⏳ Thinking...") {
//         copy[index] = { sender: "bot", text: reply };
//       } else {
//         copy.push({ sender: "bot", text: reply });
//       }
//       return copy;
//     });

//     saveChatHistory(q, reply);
//   }

//   // ---------- Image Upload + OpenAI Vision ----------
//   const fileInputRef = useRef(null);
//   const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
//   const [imageAnalysis, setImageAnalysis] = useState("");
//   const [imageStatus, setImageStatus] = useState("");

//   async function handleFileUpload(e) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = async (ev) => {
//       setImagePreviewSrc(ev.target.result);
//       setImageStatus("⏳ Analyzing...");
//       setImageAnalysis("");
//       // We'll use OpenAI chat to analyze the image: send the data URI as a context
//       const key = import.meta.env.VITE_OPENAI_API_KEY;
//       if (!key) {
//         setImageStatus("⚠️ OpenAI key missing. Provide VITE_OPENAI_API_KEY in .env.");
//         return;
//       }

//       try {
//         // Note: OpenAI's vision integrations / image uploads vary by account and SDK.
//         // Here we call the Chat Completions endpoint and include a short prompt + the data URI in the user message.
//         // For large images, data URI could be huge — alternatively upload image to your server / S3 and pass a URL.
//         const systemPrompt = "You are an expert agronomist. Analyze the image the user provided for pests, diseases, nutrient deficiency signs and give short clear actions.";
//         const userMessage = `IMAGE_DATA_URI:${ev.target.result}\n\nPlease analyze and provide likely diagnosis and recommended actions (short).`;

//         const resp = await fetch("https://api.openai.com/v1/chat/completions", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${key}`,
//           },
//           body: JSON.stringify({
//             model: "gpt-4o-mini", // adjust to model with vision if available in your account
//             messages: [
//               { role: "system", content: systemPrompt },
//               { role: "user", content: userMessage },
//             ],
//             max_tokens: 500,
//             temperature: 0.0,
//           }),
//         });
//         const data = await resp.json();
//         const result = data?.choices?.[0]?.message?.content?.trim() || "No analysis returned.";
//         setImageAnalysis(result);
//         setImageStatus("✅ Analysis complete.");
//         // save to chat history
//         saveChatHistory("Image uploaded for analysis", result);
//       } catch (err) {
//         console.error("Vision error:", err);
//         setImageStatus("⚠️ Failed to analyze image.");
//       }
//     };
//     reader.readAsDataURL(file);
//   }

//   // ---------- Weather (OpenWeather) ----------
//   const [locationInput, setLocationInput] = useState("");
//   const [weatherData, setWeatherData] = useState(null);
//   const [activeWeatherTab, setActiveWeatherTab] = useState("current");

//   // Helper: geocode city name → lat/lon (OpenWeather geocoding)
//   async function geocodeCity(city) {
//     const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
//     if (!key) throw new Error("OpenWeather API key missing (VITE_OPENWEATHER_API_KEY).");
//     const q = encodeURIComponent(city);
//     const url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${key}`;
//     const resp = await fetch(url);
//     const arr = await resp.json();
//     if (!Array.isArray(arr) || arr.length === 0) throw new Error("Location not found.");
//     return { lat: arr[0].lat, lon: arr[0].lon, name: arr[0].name, country: arr[0].country };
//   }

//   // fetch One Call (current + daily)
//   async function fetchWeatherByCoords(lat, lon) {
//     const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
//     if (!key) throw new Error("OpenWeather API key missing.");
//     // One Call 3.0 uses a paid endpoint; using 2.5/onecall for compatibility — check your plan and endpoints
//     const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&appid=${key}`;
//     const resp = await fetch(url);
//     const js = await resp.json();
//     // normalize to expected shape
//     return {
//       location: `${lat.toFixed(3)},${lon.toFixed(3)}`,
//       current: {
//         temp: js.current?.temp,
//         condition: js.current?.weather?.[0]?.description,
//         icon: js.current?.weather?.[0]?.icon,
//         humidity: js.current?.humidity,
//         wind: js.current?.wind_speed + " m/s",
//       },
//       daily: (js.daily || []).slice(0, 7).map((d) => ({
//         dt: d.dt,
//         icon: d.weather?.[0]?.icon,
//         description: d.weather?.[0]?.description,
//         temp: { max: d.temp?.max, min: d.temp?.min },
//       })),
//     };
//   }

//   async function searchLocation() {
//     if (!locationInput.trim()) return alert("Enter location name.");
//     try {
//       const geo = await geocodeCity(locationInput.trim());
//       const w = await fetchWeatherByCoords(geo.lat, geo.lon);
//       w.location = `${geo.name}, ${geo.country}`;
//       setWeatherData(w);
//       setActiveWeatherTab("current");
//     } catch (err) {
//       console.error("Weather error:", err);
//       alert("Location/weather lookup failed: " + (err.message || err));
//     }
//   }

//   function useMyLocationForWeather() {
//     if (!navigator.geolocation) return alert("Geolocation not supported");
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           const w = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
//           w.location = "Your location";
//           setWeatherData(w);
//           setActiveWeatherTab("current");
//         } catch (err) {
//           console.error(err);
//           alert("Failed to fetch weather for your location");
//         }
//       },
//       (err) => {
//         alert("Geolocation denied or unavailable");
//       }
//     );
//   }

//   // ---------- Market live integration ----------
//   const [marketLocation, setMarketLocation] = useState("palakkad");
//   const [marketRows, setMarketRows] = useState([]); // array of objects
//   const [marketLoading, setMarketLoading] = useState(false);

//   // The component supports a configurable market API. If you have a market API, set VITE_MARKET_API_URL to its endpoint.
//   // The fetchMarketData function will call that endpoint with optional query params (location).
//   // If no env var, the component will use internal mock data so UI works.
//   const MARKET_API_URL = import.meta.env.VITE_MARKET_API_URL || null;
//   const MARKET_API_KEY = import.meta.env.VITE_MARKET_API_KEY || null;

//   async function fetchMarketData(location = marketLocation) {
//     setMarketLoading(true);
//     try {
//       if (!MARKET_API_URL) {
//         // fallback mock data
//         const mock = [
//           { crop: "Rice", price: "₹2,600/quintal", change: "+1.2%", min: "₹2,500", max: "₹2,700", volume: "1,200 qt" },
//           { crop: "Wheat", price: "₹2,900/quintal", change: "-0.5%", min: "₹2,800", max: "₹3,000", volume: "750 qt" },
//           { crop: "Tomato", price: "₹3,500/quintal", change: "+4.8%", min: "₹2,900", max: "₹3,800", volume: "450 qt" },
//         ];
//         setMarketRows(mock);
//         setMarketLoading(false);
//         return;
//       }
//       // call your market API — expected to return JSON array of {crop, price, change, min, max, volume}
//       const url = new URL(MARKET_API_URL);
//       if (location) url.searchParams.set("location", location);
//       if (MARKET_API_KEY) url.searchParams.set("apikey", MARKET_API_KEY);

//       const resp = await fetch(url.toString());
//       if (!resp.ok) throw new Error(`Market API failed: ${resp.status}`);
//       const data = await resp.json();
//       // adapt data shape if necessary; assume data.rows or data.results or direct array
//       const rows = Array.isArray(data) ? data : data.rows || data.results || [];
//       setMarketRows(rows);
//     } catch (err) {
//       console.error("Market fetch error:", err);
//       // fallback to mock on error
//       setMarketRows([
//         { crop: "Rice", price: "₹2,600/quintal", change: "+1.2%", min: "₹2,500", max: "₹2,700", volume: "1,200 qt" },
//       ]);
//     } finally {
//       setMarketLoading(false);
//     }
//   }

//   useEffect(() => {
//     // initial market fetch
//     fetchMarketData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- Crop Calendar (static data kept from original) ----------
//   const cropData = {
//     rice: {
//       name: "Rice (धान)",
//       overview: {
//         description: "Rice is the staple crop; select variety per region.",
//         soilType: "Clay loam, pH 5.5-7.0",
//       },
//       timeline: [
//         { stage: "Land Preparation", period: "May-June", icon: "🚜" },
//         { stage: "Transplanting", period: "July", icon: "🌱" },
//         { stage: "Vegetative Growth", period: "Aug-Sep", icon: "🌿" },
//       ],
//     },
//     tomato: {
//       name: "Tomato (टमाटर)",
//       overview: { description: "Warm season vegetable." },
//       timeline: [{ stage: "Nursery", period: "Sep", icon: "🌱" }, { stage: "Harvest", period: "Feb-Mar", icon: "🚛" }],
//     },
//   };
//   const [selectedCropKey, setSelectedCropKey] = useState("rice");
//   const [selectedSeason, setSelectedSeason] = useState("kharif");
//   const [selectedRegion, setSelectedRegion] = useState("south");

//   // ---------- Community forum ----------
//   const [forumPosts, setForumPosts] = useState(() => [
//     { id: Date.now() - 10000, title: "Best fertilizer for wheat?", content: "Looking for suggestions", category: "Advice" },
//   ]);
//   const [postTitle, setPostTitle] = useState("");
//   const [postContent, setPostContent] = useState("");
//   const [postCategory, setPostCategory] = useState("General");

//   function addForumPost() {
//     if (!postTitle.trim() || !postContent.trim()) {
//       alert("Title and content required");
//       return;
//     }
//     const newPost = { id: Date.now(), title: postTitle.trim(), content: postContent.trim(), category: postCategory };
//     setForumPosts((p) => [newPost, ...p]);
//     setPostTitle("");
//     setPostContent("");
//     setPostCategory("General");
//   }

//   // ---------- Voice simulation (light) ----------
//   const [isRecording, setIsRecording] = useState(false);
//   const [voiceText, setVoiceText] = useState("");
//   const [voiceResponse, setVoiceResponse] = useState("");

//   function toggleRecording() {
//     if (!isRecording) {
//       setIsRecording(true);
//       setVoiceText("Listening...");
//       setTimeout(async () => {
//         const simulatedTranscription = "How much urea apply on rice at 30 days?";
//         setVoiceText(simulatedTranscription);
//         // auto-call OpenAI with transcription
//         const reply = await callOpenAIChat(simulatedTranscription);
//         setVoiceResponse(reply);
//         saveChatHistory(simulatedTranscription, reply);
//         setIsRecording(false);
//       }, 1500);
//     } else {
//       setIsRecording(false);
//       setVoiceText("");
//     }
//   }

//   // ---------- small helpers ----------
//   function openChatModal(mode = "text") {
//     if (mode === "audio") {
//       setIsVoiceOpen(true);
//       setVoiceText("");
//       return;
//     }
//     setChatOpen(true);
//   }

//   // ---------- JSX Render (UI preserved) ----------
//   return (
//     <div>
//       {/* Header */}
//       <header className="header">
//         <div className="left-section">
//           <img src="/logo.png" alt="Farm Assist Logo" className="logo" />
//           <span className="welcome">Hello, <strong>Ramu</strong></span>
//           <span className="location"><i className="fas fa-map-marker-alt"></i> Palakkad</span>
//         </div>

//         <div className="right-section">
//           <div className="profile-container">
//             <img
//               src="/profile.png"
//               alt="Profile"
//               className="profile-pic"
//               id="profileBtn"
//               onClick={() => setProfileOpen((p) => !p)}
//             />
//             <div className="profile-popup" id="profilePopup" style={{ display: profileOpen ? "block" : "none" }}>
//               <p><strong>Name:</strong> Ramu</p>
//               <p><strong>Queries Asked:</strong> {chatHistoryArray.length}</p>
//               <p><strong>Points Earned:</strong> {chatHistoryArray.length * 10}</p>
//               <p><strong>Crop:</strong> Wheat</p>
//             </div>
//           </div>
//           <a href="land.html" className="logout-btn" onClick={handleLogout}>Logout</a>
//         </div>
//       </header>

//       {/* Hero */}
//       <section className="wavy-section">
//         <div className="wavy-bg">
//           <div className="wavy-content">
//             <div className="wavy-text">
//               <h1>AI That Speaks Farmer</h1>
//               <p>Ask about crops, pests, weather, or farm care and get instant advice.</p>
//             </div>
//             <div className="wavy-image"></div>
//           </div>
//         </div>
//       </section>

//       {/* Quick Action Cards */}
//       <section className="cards-section">
//         <div className="card">
//           <i className="fas fa-keyboard fa-3x card-icon"></i>
//           <p>Type your question</p>
//           <button onClick={() => openChatModal("text")}>Type Query</button>
//         </div>
//         <div className="card">
//           <i className="fas fa-microphone fa-3x card-icon"></i>
//           <p>Speak your query</p>
//           <button onClick={() => openChatModal("audio")}>Record Voice Query</button>
//         </div>
//         <div className="card">
//           <i className="fas fa-image fa-3x card-icon"></i>
//           <p>Upload an image</p>
//           <button onClick={() => { setImageOpen(true); }}>Upload Image</button>
//         </div>
//       </section>

//       {/* Feature Grid */}
//       <div className="container">
//         <section className="cards-grid">
//           <div className="card" onClick={() => setCropCalendarOpen(true)}><h3>Crop Calendar</h3><p>Track sowing & harvest</p></div>
//           <div className="card" onClick={() => { setWeatherOpen(true); useMyLocationForWeather(); }}><h3>Weather Alerts</h3><p>Get live weather</p></div>
//           <div className="card" onClick={() => setMarketOpen(true)}><h3>Market Updates</h3><p>Local crop prices</p></div>
//           <div className="card" onClick={() => setCommunityOpen(true)}><h3>Community Forum</h3><p>Discuss with farmers</p></div>
//           <div className="card row2" onClick={() => setLearningOpen(true)}><h3>Learning Hub</h3></div>
//           <div className="card row2" onClick={() => setRewardsOpen(true)}><h3>Rewards</h3></div>
//           <div className="card row2"><h3>Officer Escalation</h3><p>Send complex queries to officers</p></div>
//         </section>
//       </div>

//       {/* Chat Modal */}
//       {isChatOpen && (
//         <div id="chatModal" className="modal" style={{ display: "block" }}>
//           <div className="modal-content chatbot-modal">
//             <div className="chatbot-header">
//               <h3>Farm Assist Chatbot</h3>
//               <div className="header-controls">
//                 <button className="history-toggle-btn" onClick={() => setIsHistoryVisible((v) => !v)} title="Toggle History"><i className="fas fa-list" /></button>
//                 <span className="close" onClick={() => setChatOpen(false)}>&times;</span>
//               </div>
//             </div>

//             <div className="chatbot-container">
//               <div className="chat-main">
//                 <div id="chatMessages" className="chat-messages" ref={chatMessagesRef}>
//                   {chatMessages.map((m, i) => (
//                     m.sender === "bot" ? (
//                       <div className="bot-message" key={i}><div className="message-avatar">🤖</div><div className="message-content">{m.text}</div></div>
//                     ) : (
//                       <div className="user-message" key={i}><div className="message-avatar">👤</div><div className="message-content">{m.text}</div></div>
//                     )
//                   ))}
//                 </div>

//                 <div className="chat-input-area">
//                   <div className="input-area">
//                     <input type="text" id="chatInput" placeholder="Ask about crops, prices, pest control..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
//                     <button onClick={sendMessage} id="sendBtn"><i className="fas fa-paper-plane" /></button>
//                   </div>
//                 </div>
//               </div>

//               {isHistoryVisible && (
//                 <div className="chat-sidebar" id="chatSidebar">
//                   <h4>Chat History</h4>
//                   <div id="chatHistory" className="history-list">
//                     {chatHistoryArray.length === 0 ? <div className="history-item">No previous chats</div> : chatHistoryArray.map(h => (
//                       <div className="history-item" key={h.id}><div style={{ fontWeight: 600 }}>{h.question}</div><div style={{ fontSize: ".9rem" }}>{h.answer}</div><div style={{ fontSize: ".8rem", color: "#666" }}>{h.timestamp}</div></div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image Modal */}
//       {isImageOpen && (
//         <div id="imageModal" className="modal" style={{ display: "block" }}>
//           <div className="modal-content image-modal">
//             <div className="image-header">
//               <h3>Upload Image for Analysis</h3>
//               <span className="close" onClick={() => setImageOpen(false)}>&times;</span>
//             </div>

//             <div className="image-container">
//               <div className="upload-options" style={{ display: imagePreviewSrc ? "none" : "flex" }}>
//                 <div className="upload-option" onClick={() => fileInputRef.current?.click()}><i className="fas fa-upload fa-3x" /><h4>Upload File</h4><p>Choose image from device</p></div>
//               </div>

//               <input type="file" id="fileInput" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />

//               {imagePreviewSrc && (
//                 <div id="imagePreviewSection" className="image-preview-section">
//                   <div className="image-preview"><img id="previewImage" src={imagePreviewSrc} alt="Uploaded" /></div>
//                   <div className="ocr-results">
//                     <h4>AI Analysis Status</h4>
//                     <div id="extractedText" className="extracted-text">{imageStatus}</div>
//                     {imageAnalysis && <div className="image-response"><h4>AI Findings</h4><div>{imageAnalysis}</div></div>}
//                     <div className="ocr-actions"><button onClick={() => { setImagePreviewSrc(null); setImageAnalysis(""); setImageStatus(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Upload Another</button></div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Weather Modal */}
//       {isWeatherOpen && (
//         <div id="weatherModal" className="modal" style={{ display: "block" }}>
//           <div className="modal-content weather-modal">
//             <div className="weather-header"><h3>Advanced Weather Forecast & Alerts</h3><span className="close" onClick={() => setWeatherOpen(false)}>&times;</span></div>
//             <div className="weather-container">
//               <div className="location-search">
//                 <input type="text" id="locationInput" placeholder="Search location..." value={locationInput} onChange={(e) => setLocationInput(e.target.value)} />
//                 <button onClick={searchLocation}>Search</button>
//                 <button onClick={useMyLocationForWeather}>Use Current Location</button>
//               </div>

//               <div className="weather-tabs">
//                 <button className={`tab-btn ${activeWeatherTab === "current" ? "active" : ""}`} onClick={() => setActiveWeatherTab("current")}>Current</button>
//                 <button className={`tab-btn ${activeWeatherTab === "weekly" ? "active" : ""}`} onClick={() => setActiveWeatherTab("weekly")}>7-Day</button>
//                 <button className={`tab-btn ${activeWeatherTab === "farming" ? "active" : ""}`} onClick={() => setActiveWeatherTab("farming")}>Farm Advisory</button>
//               </div>

//               <div className="weather-display">
//                 {!weatherData ? (
//                   <div>Please search a location or use current location.</div>
//                 ) : (
//                   <>
//                     {activeWeatherTab === "current" && (
//                       <div className="current-weather">
//                         <div className="weather-main">
//                           <div className="weather-icon">{weatherData.current.icon}</div>
//                           <div className="temperature">{Math.round(weatherData.current.temp)}°C</div>
//                           <div className="weather-desc">{weatherData.current.condition}</div>
//                           <div className="location-info">📍 {weatherData.location}</div>
//                         </div>
//                         <div className="weather-details">
//                           <div className="detail-item"><span className="label">Humidity</span><span className="value">{weatherData.current.humidity}%</span></div>
//                           <div className="detail-item"><span className="label">Wind</span><span className="value">{weatherData.current.wind}</span></div>
//                         </div>
//                       </div>
//                     )}

//                     {activeWeatherTab === "weekly" && (
//                       <div className="weekly-forecast">
//                         {weatherData.daily.map((d, i) => (
//                           <div key={i} className="forecast-day">
//                             <div>{new Date(d.dt * 1000).toLocaleDateString()}</div>
//                             <div>{d.description}</div>
//                             <div>{Math.round(d.temp.max)}° / {Math.round(d.temp.min)}°</div>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {activeWeatherTab === "farming" && (
//                       <div className="farming-advisory">
//                         <div className="advisory-card"><h4>Crop Advisory</h4><p>Monitor leaf wetness — fungal risk increased when high humidity during night.</p></div>
//                         <div className="advisory-card"><h4>Irrigation</h4><p>Top up irrigation if no rainfall expected in next 3 days.</p></div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Crop Calendar Modal */}
//       {isCropCalendarOpen && (
//         <div id="cropCalendarModal" className="modal" style={{ display: "block" }}>
//           <div className="modal-content crop-calendar-modal">
//             <div className="crop-calendar-header"><h3>Crop Calendar</h3><span className="close" onClick={() => setCropCalendarOpen(false)}>&times;</span></div>
//             <div className="crop-calendar-container">
//               <div className="crop-selection">
//                 <label htmlFor="cropSelect">Select Crop:</label>
//                 <select id="cropSelect" value={selectedCropKey} onChange={(e) => setSelectedCropKey(e.target.value)}>
//                   {Object.keys(cropData).map(k => <option key={k} value={k}>{cropData[k].name}</option>)}
//                 </select>
//               </div>

//               <div className="crop-timeline">
//                 <h4>Timeline for {cropData[selectedCropKey].name}</h4>
//                 <div className="timeline-container">
//                   {cropData[selectedCropKey].timeline.map((s, i) => (
//                     <div key={i} className="timeline-item"><div className="timeline-icon">{s.icon}</div><div className="timeline-content"><h5>{s.stage}</h5><div className="timeline-period">{s.period}</div></div></div>
//                   ))}
//                 </div>
//               </div>

//               <div className="crop-details">
//                 <h4>Overview</h4>
//                 <p>{cropData[selectedCropKey].overview.description}</p>
//                 <p><strong>Soil:</strong> {cropData[selectedCropKey].overview.soilType || "-"}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Market Modal */}
//       {isMarketOpen && (
//         <div id="marketModal" className="modal" style={{ display: "block" }}>
//           <div className="modal-content market-modal">
//             <div className="market-header"><h3>Market Updates</h3><span className="close" onClick={() => setMarketOpen(false)}>&times;</span></div>
//             <div className="market-container">
//               <div className="market-controls">
//                 <label>Market Location:</label>
//                 <select value={marketLocation} onChange={(e) => setMarketLocation(e.target.value)}>
//                   <option value="palakkad">Palakkad</option>
//                   <option value="coimbatore">Coimbatore</option>
//                   <option value="bangalore">Bangalore</option>
//                 </select>
//                 <button onClick={() => fetchMarketData(marketLocation)}>Refresh</button>
//               </div>

//               <div className="price-table-container">
//                 {marketLoading ? <div>Loading...</div> : (
//                   <table className="price-table">
//                     <thead><tr><th>Crop</th><th>Price</th><th>Change</th><th>Min</th><th>Max</th><th>Volume</th></tr></thead>
//                     <tbody>
//                       {marketRows.map((r, i) => (
//                         <tr key={i}>
//                           <td>{r.crop}</td>
//                           <td>{r.price}</td>
//                           <td>{r.change}</td>
//                           <td>{r.min}</td>
//                           <td>{r.max}</td>
//                           <td>{r.volume}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Community Modal */}
//       {isCommunityOpen && (
//         <div id="communityModal" className="modal" style={{ display: "block" }}>
//           <div className="modal-content community-modal">
//             <div className="community-header"><h3>Community Forum</h3><span className="close" onClick={() => setCommunityOpen(false)}>&times;</span></div>
//             <div className="community-container">
//               <div className="forum-posts">
//                 {forumPosts.map(p => <div key={p.id} className="forum-post"><h4>{p.title}</h4><p>{p.content}</p><small>{p.category}</small></div>)}
//               </div>
//               <div className="new-post">
//                 <input placeholder="Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
//                 <textarea placeholder="Content" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
//                 <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)}><option>General</option><option>Advice</option><option>Market</option></select>
//                 <button onClick={addForumPost}>Post</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Learning & Rewards (placeholders) */}
//       {isLearningOpen && (<div className="modal"><div className="modal-content learning-hub-modal"><div className="learning-hub-header"><h3>Learning Hub</h3><span className="close" onClick={() => setLearningOpen(false)}>&times;</span></div><div className="learning-hub-container"><p>[Videos & quizzes placeholder]</p></div></div></div>)}
//       {isRewardsOpen && (<div className="modal"><div className="modal-content rewards-popup"><div className="rewards-popup-header"><h3>Rewards</h3><span className="close" onClick={() => setRewardsOpen(false)}>&times;</span></div><div className="rewards-popup-container"><p>[Rewards & coins placeholder]</p></div></div></div>)}

//     </div>
//   );
// }
// src/Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import "./dashboard.css";
// import cropCalendar from "./cropCalendar.json";

export default function Dashboard() {
  // ----------------- UI State -----------------
  const [profileOpen, setProfileOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isImageOpen, setImageOpen] = useState(false);

  // ----------------- Profile Logic -----------------
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

  // ----------------- Chat State -----------------
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "👋 Welcome to Farm Assist! How can I help you today?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ----------------- APIs -----------------
  async function fetchWeather(city = "Palakkad") {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const data = await resp.json();
      return `Weather in ${city}: ${data.weather[0].description}, Temp: ${data.main.temp}°C, Humidity: ${data.main.humidity}%`;
    } catch {
      return "⚠️ Failed to fetch weather.";
    }
  }

  async function fetchMarketPrice(crop = "wheat") {
    try {
      const url = import.meta.env.VITE_MARKET_API_URL;
      const apiKey = import.meta.env.VITE_MARKET_API_KEY;
      if (!url || !apiKey) {
        return `Latest ${crop} price (mock): ₹2200/quintal at Palakkad market.`;
      }
      const resp = await fetch(`${url}?crop=${crop}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await resp.json();
      return `Latest price of ${crop}: ₹${data.price}/quintal at ${data.market}`;
    } catch {
      return "⚠️ Failed to fetch market prices.";
    }
  }

  async function fetchCropCalendar(crop = "wheat") {
    return cropCalendar[crop.toLowerCase()] || "No calendar data available.";
  }

  // ----------------- AI Chat with RAG -----------------
  async function generateFarmingResponse(question) {
    let context = "";

    if (question.toLowerCase().includes("weather")) {
      context = await fetchWeather("Palakkad");
    } else if (question.toLowerCase().includes("price") || question.toLowerCase().includes("market")) {
      context = await fetchMarketPrice("wheat");
    } else if (
      question.toLowerCase().includes("sow") ||
      question.toLowerCase().includes("harvest") ||
      question.toLowerCase().includes("calendar")
    ) {
      context = await fetchCropCalendar("wheat");
    }

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are FarmAssist, an AI Krishi Advisor. Use live data context if provided, else answer from knowledge.",
            },
            { role: "user", content: `${question}\n\nContext: ${context}` },
          ],
        }),
      });

      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || "⚠️ No response.";
    } catch (err) {
      console.error(err);
      return "⚠️ Failed to connect to AI.";
    }
  }

  async function sendMessage() {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages((p) => [...p, { sender: "user", text: msg }, { sender: "bot", text: "⏳ Thinking..." }]);
    setChatInput("");

    const reply = await generateFarmingResponse(msg);
    setChatMessages((p) => {
      const copy = [...p];
      copy[copy.length - 1] = { sender: "bot", text: reply };
      return copy;
    });
  }

  // ----------------- Image Analysis -----------------
  const fileInputRef = useRef(null);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [imageAnalysis, setImageAnalysis] = useState("");

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      setImagePreviewSrc(ev.target.result);
      setOcrText("⏳ Analyzing image...");
      setImageAnalysis("");

      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4-vision-preview",
            messages: [
              { role: "system", content: "You are an agronomist AI. Analyze crop images." },
              {
                role: "user",
                content: [
                  { type: "text", text: "Analyze this crop image and suggest possible treatments." },
                  { type: "image_url", image_url: ev.target.result },
                ],
              },
            ],
            max_tokens: 400,
          }),
        });
        const data = await res.json();
        const result = data.choices?.[0]?.message?.content?.trim() || "⚠️ No analysis.";
        setOcrText("✅ Image processed.");
        setImageAnalysis(result);
      } catch (err) {
        console.error(err);
        setOcrText("⚠️ Failed to analyze image.");
      }
    };
    reader.readAsDataURL(file);
  }

  // ----------------- UI -----------------
  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="left-section">
          <img src="/logo.png" alt="Farm Assist Logo" className="logo" />
          <span className="welcome">Hello, <strong>Ramu</strong></span>
          <span className="location"><i className="fas fa-map-marker-alt"></i> Palakkad</span>
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
              <p><strong>Queries Asked:</strong> {chatMessages.filter(m => m.sender === "user").length}</p>
              <p><strong>Points Earned:</strong> {chatMessages.filter(m => m.sender === "user").length * 10}</p>
              <p><strong>Crop:</strong> Wheat</p>
            </div>
          </div>
          <a href="land.html" className="logout-btn" onClick={handleLogout}>Logout</a>
        </div>
      </header>

      {/* Feature Cards */}
      <section className="cards-section">
        <div className="card">
          <i className="fas fa-keyboard fa-3x card-icon"></i>
          <p>Type your farming query</p>
          <button onClick={() => setChatOpen(true)}>Chat</button>
        </div>
        <div className="card">
          <i className="fas fa-image fa-3x card-icon"></i>
          <p>Upload a crop image</p>
          <button onClick={() => setImageOpen(true)}>Upload</button>
        </div>
      </section>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="modal">
          <div className="modal-content chatbot-modal">
            <div className="chatbot-header">
              <h3>Farm Assist Chatbot</h3>
              <span className="close" onClick={() => setChatOpen(false)}>&times;</span>
            </div>
            <div className="chatbot-container">
              <div className="chat-messages" ref={chatMessagesRef}>
                {chatMessages.map((m, i) => (
                  <div key={i} className={m.sender === "user" ? "user-message" : "bot-message"}>
                    <div className="message-avatar">{m.sender === "user" ? "👤" : "🤖"}</div>
                    <div className="message-content">{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-area">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about crops, prices, weather..."
                />
                <button onClick={sendMessage}><i className="fas fa-paper-plane"></i></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageOpen && (
        <div className="modal">
          <div className="modal-content image-modal">
            <div className="image-header">
              <h3>Upload Crop Image</h3>
              <span className="close" onClick={() => setImageOpen(false)}>&times;</span>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} />
            {imagePreviewSrc && (
              <div className="image-preview-section">
                <img src={imagePreviewSrc} alt="Preview" />
                <p>{ocrText}</p>
                {imageAnalysis && <div className="image-response">{imageAnalysis}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
