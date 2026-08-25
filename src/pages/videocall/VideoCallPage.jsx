import React, { useEffect, useState } from "react";
import JitsiMeet from "./Jitsimeet";
import { JaaSMeeting, JitsiMeeting } from "@jitsi/react-sdk";
import { Spinner } from "reactstrap";
import { useSelector } from "react-redux";

export default function VirtualClassApp() {
  const { user } = useSelector((s) => s.auth);

  const [role, setRole] = useState(null);
  const [roomName, setRoomName] = useState("VirtualClassroom");

  useEffect(() => {
    if (user?.user_type) {
      setRole(user.user_type);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-gray-100 rounded-lg shadow">
          <h2 className="text-xl font-semibold">
            Please log in to join the video call
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-semibold">Welcome {user.name}!</h1>
        <p className="text-sm text-gray-600">Role: {role}</p>
      </header>

      {role && (
        <div>
          <JaaSMeeting
            appId={"vpaas-magic-cookie-47847f563c6e4949bc58070b18d8df34"}
            roomName="virtualClass"
            userInfo={{
              displayName: user.name,
            }}
            // jwt={YOUR_VALID_JWT}
            configOverwrite={{
              disableLocalVideoFlip: true,
              backgroundAlpha: 0.5,
            }}
            interfaceConfigOverwrite={{
              VIDEO_LAYOUT_FIT: "nocrop",
              MOBILE_APP_PROMO: false,
              TILE_VIEW_MAX_COLUMNS: 4,
            }}
            // spinner={<div>Loading...</div>}
            // onApiReady = { (externalApi) => { ... } }
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "500px";
            }}
          />
        </div>
      )}
    </div>
  );
}
