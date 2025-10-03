import { createFileRoute } from "@tanstack/react-router";
import StateAnalysis from "@/pages/state-analysis.tsx";

// Table imports 
import type {Voter} from "../../components/table/columns"

export const Route = createFileRoute("/state/$stateName")({
  params: {
    parse: (params) => ({
      stateName: params.stateName,
    }),
  },
  component: State,
});

function getData(stateName: string): Voter[] {
  // Scrap the hardcoded json
  // Fetch data from your API here.
  // Ideally async
  return stateName == "florida"?
  [
    { "id": "728ed52f", "name": "John Doe", "email": "m@example.com", "registered": "true" },
    { "id": "8a9f34b2", "name": "Jane Smith", "email": "jane.smith@example.com", "registered": "true" },
    { "id": "c4d7e91a", "name": "Michael Johnson", "email": "m.johnson@example.com", "registered": "false" },
    { "id": "f1b3a62c", "name": "Emily Davis", "email": "emily.davis@example.com", "registered": "true" },
    { "id": "a94b82f0", "name": "David Brown", "email": "david.brown@example.com", "registered": "true" },
    { "id": "3c7e12f9", "name": "Sarah Wilson", "email": "sarah.wilson@example.com", "registered": "false" },
    { "id": "d91a54c8", "name": "Chris Lee", "email": "chris.lee@example.com", "registered": "true" },
  ]:
  [
    { "id": "ef23a79d", "name": "Jessica Taylor", "email": "jessica.taylor@example.com", "registered": "true" },
    { "id": "45b8e20c", "name": "Daniel Martinez", "email": "dan.martinez@example.com", "registered": "false" },
    { "id": "76fa19b3", "name": "Laura Anderson", "email": "laura.anderson@example.com", "registered": "true" },
    { "id": "b92cd48e", "name": "James Thomas", "email": "james.thomas@example.com", "registered": "true" },
    { "id": "e83a05df", "name": "Olivia Garcia", "email": "olivia.garcia@example.com", "registered": "false" },
    { "id": "59fcd71a", "name": "Matthew Rodriguez", "email": "matt.rodriguez@example.com", "registered": "true" },
    { "id": "aa37b2d5", "name": "Sophia Hernandez", "email": "sophia.hernandez@example.com", "registered": "true" },
    { "id": "1d4e8f6c", "name": "Ethan Clark", "email": "ethan.clark@example.com", "registered": "false" }
  ]
}

function State() {
  const { stateName } = Route.useParams();
  const data = getData(stateName)

  return <StateAnalysis stateName={stateName} tableData = {data}/>;
}
