 import { useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  function handleMsg(e) {
    setMsg(e.target.value);
  }

  function processFile(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const extractedEmails = json.map((i) => i.A);
      setEmailList(extractedEmails);
    };

    reader.readAsBinaryString(file);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    processFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }

  function send() {
    setStatus(true);
    axios
      .post("https://bulkmail-backend-7v5b.onrender.com/sendmail", {
        msg: msg,
        emailList: emailList,
      })
      .then((data) => {
        if (data.data === true) {
          alert("✅ Emails sent successfully!");
          setStatus(false);
        } else {
          alert("❌ Failed to send emails.");
        }
      })
      .catch((err) => {
        console.error("❌ Error:", err);
        alert("Sending failed. Check console for details.");
        setStatus(false);
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      {/* HEADER */}
      <header className="bg-blue-600 text-white text-center py-8 shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-lg">
          Bulk Mail Sender
        </h1>
      </header>

      {/* MAIN CARD */}
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl transition-all duration-300">
        <h3 className="text-2xl font-semibold text-blue-700 text-center mb-3">
          Send Emails Effortlessly
        </h3>

        <textarea
          value={msg}
          onChange={handleMsg}
          placeholder="Write your message..."
          className="w-full h-32 p-3 border rounded-md border-gray-400 focus:ring-2 focus:ring-blue-400 outline-none transition"
        ></textarea>

        {/* DRAG & DROP UPLOADER */}
        <div
          className={`mt-5 p-6 border-2 border-dashed rounded-xl text-center transition cursor-pointer
          ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-400"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFile}
          />
          <p className="text-gray-700 font-medium">
            {dragActive ? "Drop file here..." : "Drag & drop your Excel file or click to browse"}
          </p>
        </div>

        <p className="mt-3 text-lg font-medium text-center">
          Loaded Emails: <span className="font-bold">{emailList.length}</span>
        </p>

        {/* BUTTON */}
        <button
          onClick={send}
          disabled={status}
          className={`w-full py-3 mt-5 text-white rounded-lg font-semibold transition
            ${status ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {status ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </span>
          ) : (
            "Send Emails"
          )}
        </button>
      </div>

      {/* FOOTER SPACING */}
      <div className="h-32"></div>
    </div>
  );
}

export default App;
