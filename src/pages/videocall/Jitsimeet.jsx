import React, { useEffect, useState } from "react";
import axios from "axios";

export default function JitsiMeet({ roomName, userName, role }) {
  const [jwtToken, setJwtToken] = useState(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [error, setError] = useState(null);
  const jitsiContainerRef = React.useRef(null);

  // Add Jitsi Meet External API script
  useEffect(() => {
    const loadJitsiScript = () => {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => setIsApiReady(true);
      script.onerror = () => setError("Failed to load Jitsi Meet API");
      document.body.appendChild(script);
    };

    loadJitsiScript();

    return () => {
      // Cleanup script on unmount
      const script = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
      // if (script) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Fetch JWT token from backend
    const fetchToken = async () => {
      try {
        const response = await axios.post(
          "http://localhost:34568//video-call-token",
          {
            roomName,
            userName,
            role,
          }
        );
        setJwtToken(response.data.token);
      } catch (error) {
        console.error("Error fetching token:", error);
        // Consider adding error state handling here
        // setError(error.message);
      }
    };

    fetchToken();
  }, [roomName, userName, role]);

  useEffect(() => {
    if (jwtToken && isApiReady && window.JitsiMeetExternalAPI) {
      try {
        const domain = "meet.jit.si";
        const options = {
          roomName: roomName,  // Make sure roomName is a valid string
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName,
            email: '', // Add user email if available
          },
          jwt: jwtToken,
          configOverwrite: {
            startWithAudioMuted: role === "student",
            enableWelcomePage: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS:
              role === "teacher"
                ? [
                    "microphone",
                    "camera",
                    "desktop",
                    "tileview",
                    "chat",
                    "participants-pane",
                    "recording",
                  ]
                : ["microphone", "camera", "chat", "tileview"],
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);

        if (role === "teacher") {
          api.executeCommand("toggleLobby", true);
        }

        return () => api.dispose();
      } catch (err) {
        setError(`Failed to initialize Jitsi: ${err.message}`);
      }
    }
  }, [jwtToken, isApiReady, roomName, userName, role]);

  if (error) return <div>Error: {error}</div>;
  if (!jwtToken || !isApiReady) return <div>Loading...</div>;

  return (
    <div ref={jitsiContainerRef} style={{ height: "100vh", width: "100%" }} />
  );
}
