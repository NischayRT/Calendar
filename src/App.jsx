import Calendar from "./components/Calendar";
import eventsData from "../public/events.json";

function App() {
  return <Calendar events={eventsData} />;
}

export default App;
