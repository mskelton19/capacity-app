export function getQuestionStatusStyle(status) {
  switch (status) {
    case "Done":
      return { bg: "#f0fdf4", border: "#86efac", text: "#16a34a", label: "Done" };
    case "Being Discussed":
      return { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", label: "Being Discussed" };
    case "Needs discussion":
    default:
      return { bg: "#fffbeb", border: "#fde047", text: "#b45309", label: "Needs discussion" };
  }
}
