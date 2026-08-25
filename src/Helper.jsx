import { useLocation } from "react-router-dom";
// export const server_url = "http://192.168.1.37:34568";
export const server_url = "http://localhost:34567";
// export const server_url = "https://server.brainstorm.ng/elite-api";
export const short_name = window.location.hostname.split('.')[0] === 'localhost'
  ? 'SAC'
  : window.location.hostname.split('.')[0];
export const _post = (url, data, success = (f) => f, error = (f) => f) => {
  const token = localStorage.getItem("@@auth_token");
  fetch(`${server_url}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify(data),
  })
    .then((raw) => raw.json())
    .then((result) => {
      success(result);
    })
    .catch((err) => {
      error(err);
    });
};

export const _get = (url, success = (f) => f, error = (f) => f) => {
  const token = localStorage.getItem("@@auth_token");
  fetch(`${server_url}/${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
  })
    .then((raw) => raw.json())
    .then((result) => {
      success(result);
    })
    .catch((err) => {
      error(err);
    });
};

export const _put = (url, data, success = (f) => f, error = (f) => f) => {
  const token = localStorage.getItem("@@auth_token");
  fetch(`${server_url}/${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify(data),
  })
    .then((raw) => raw.json())
    .then((result) => {
      success(result);
    })
    .catch((err) => {
      error(err);
    });
};

export const _delete = (url, data, success = (f) => f, error = (f) => f) => {
  const token = localStorage.getItem("@@auth_token");
  fetch(`${server_url}/${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify(data),
  })
    .then((raw) => raw.json())
    .then((result) => {
      success(result);
    })
    .catch((err) => {
      error(err);
    });
};

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}
export default useQuery;

export function toParagraph(text) {
  if (text) {
    // Split the text into paragraphs
    let paragraphs = text.split("\n");

    // Capitalize the first letter of each paragraph
    for (let i = 0; i < paragraphs.length; i++) {
      // Trim the paragraph to remove any leading/trailing whitespace
      paragraphs[i] = paragraphs[i].trim();

      // Capitalize the first letter
      if (paragraphs[i].length > 0) {
        paragraphs[i] = paragraphs[i][0].toUpperCase() + paragraphs[i].slice(1);
      }
    }

    // Join the paragraphs back together
    return paragraphs.join("\n");
  }
}

export function formatNumber1(n) {
  let num = Math.round(parseInt(n), 0);
  if (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else {
    return "0";
  }
}

export function formatNumber(n = 0) {
  if (typeof n !== "number" && typeof n !== "string") {
    return "0";
  }

  // Convert n to a number if it's a string and round it to a certain number of decimal places
  n = parseFloat(n);

  if (isNaN(n)) {
    return "0";
  }

  // Format the number with commas for thousands and round it to two decimal places
  const formattedNumber = n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formattedNumber;
}

export const separator = (num) => {
  const x = Number(num);
  return x.toLocaleString("en-US");
};

export const formatDuration = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs && mins) return `${hrs}hr ${mins}mins`;
  if (hrs) return `${hrs}hr`;
  return `${mins}mins`;
};

export const getAlpha = (index) => {
  switch (index) {
    case 0:
      return 'A';
    case 1:
      return 'B';
    case 2:
      return 'C';
    case 3:
      return 'D';
    case 4:
      return 'E';
    case 5:
      return 'F';
    case 6:
      return 'G';
    case 8:
      return 'H';
    default:
      return '';
  }
}

export const toTitleCase = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const gradePoints = [
  { value: "", label: "Select" },
  { value: "A+", label: "A+" },
  { value: "A", label: "A" },
  { value: "B+", label: "B+" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "A1", label: "A1" },
  { value: "B2", label: "B2" },
  { value: "B3", label: "B3" },
  { value: "C4", label: "C4" },
  { value: "C5", label: "C5" },
  { value: "C6", label: "C6" },
  { value: "D7", label: "D7" },
  { value: "E8", label: "E8" },
  { value: "F9", label: "F9" },
];

export const activeList = [
  { label: "Active", valeu: "Active" },
  { label: "Inactive", value: "Inactive" }
]

export   const convertTo24HourFormat = (timeStr) => {
  if(!timeStr || timeStr.length === 0) return "";
    // If already in 24-hour format (e.g., "13:45"), just return
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // If in 12-hour format (e.g., "1:45 PM"), convert
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*([APap][Mm])$/);
    if (!match) return timeStr;
    let [_, hour, minute, period] = match;
    hour = parseInt(hour, 10);
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  };
export const convertToAmPM = (timeStr) => {
    if(!timeStr || timeStr.length === 0) return "";
  const [hour, minute] = timeStr.split(":");
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 to 12
  return `${formattedHour}:${minute} ${period}`;
};