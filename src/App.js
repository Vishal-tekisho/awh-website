import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavInterceptor from "./components/NavInterceptor";

import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Availability from "./pages/Availability";
import ClinicBranch from "./pages/ClinicBranch";
import CountersPoints from "./pages/CountersPoints";
import DoctorsStaff from "./pages/DoctorsStaff";
import EquipmentResources from "./pages/EquipmentResources";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotificationsReminders from "./pages/NotificationsReminders";
import PackagesPricing from "./pages/PackagesPricing";
import PatientFields from "./pages/PatientFields";
import ReferenceAudit from "./pages/ReferenceAudit";
import ResourceAvailability from "./pages/ResourceAvailability";
import RolesDepartments from "./pages/RolesDepartments";
import RoomsAreas from "./pages/RoomsAreas";
import RosterSessions from "./pages/RosterSessions";
import ServicesConsultationTypes from "./pages/ServicesConsultationTypes";
import TreatmentsProcedures from "./pages/TreatmentsProcedures";
import UserOnboard from "./pages/UserOnboard";
import SlotsQueueRules from "./pages/SlotsQueueRules";
import EmrTemplates from "./pages/EmrTemplates";
import MedicationConfig from "./pages/MedicationConfig";
import OrdersCarePlans from "./pages/OrdersCarePlans";
import ClinicalSupportMasters from "./pages/ClinicalSupportMasters";
import NotConverted from "./pages/NotConverted";

function App() {
  return (
    <BrowserRouter>
      <NavInterceptor />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/clinic-branch" element={<ClinicBranch />} />
        <Route path="/counters-points" element={<CountersPoints />} />
        <Route path="/doctors-staff" element={<DoctorsStaff />} />
        <Route path="/equipment-resources" element={<EquipmentResources />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/notifications-reminders" element={<NotificationsReminders />} />
        <Route path="/packages-pricing" element={<PackagesPricing />} />
        <Route path="/patient-fields" element={<PatientFields />} />
        <Route path="/reference-audit" element={<ReferenceAudit />} />
        <Route path="/resource-availability" element={<ResourceAvailability />} />
        <Route path="/roles-departments" element={<RolesDepartments />} />
        <Route path="/rooms-areas" element={<RoomsAreas />} />
        <Route path="/roster-sessions" element={<RosterSessions />} />
        <Route path="/services-consultation-types" element={<ServicesConsultationTypes />} />
        <Route path="/treatments-procedures" element={<TreatmentsProcedures />} />
        <Route path="/user-onboard" element={<UserOnboard />} />
        <Route path="/slots-queue-rules" element={<SlotsQueueRules />} />
        <Route path="/emr-templates" element={<EmrTemplates />} />
        <Route path="/medication-config" element={<MedicationConfig />} />
        <Route path="/orders-care-plans" element={<OrdersCarePlans />} />
        <Route path="/clinical-support-masters" element={<ClinicalSupportMasters />} />
        <Route path="/not-converted" element={<NotConverted />} />
        <Route path="*" element={<NotConverted />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
