class ERQueue {
  constructor() {
    this.patients = new Map();
    this.staffCount = 3;
    this.treatingCount = 0;
    this.listeners = new Set();
    this.criticalAlerts = [];
  }

  addPatient(patient) {
    this.patients.set(patient.id, patient);
    this.notifyCritical(patient);
    this.broadcastNotification({
      type: "patient_added",
      patient: patient.getDetails(),
      queueLength: this.getSortedQueue().length,
    });
    return patient;
  }

  getSortedQueue() {
    return Array.from(this.patients.values())
      .filter((p) => p.status === "waiting")
      .sort((a, b) => {
        if (a.triageLevel === 1 && b.triageLevel !== 1) return -1;
        if (b.triageLevel === 1 && a.triageLevel !== 1) return 1;

        if (a.triageLevel !== b.triageLevel) {
          return a.triageLevel - b.triageLevel;
        }

        return a.arrivalTime.getTime() - b.arrivalTime.getTime();
      });
  }

  notifyCritical(patient) {
    if (patient.triageLevel === 1) {
      const criticalAlert = {
        id: patient.id,
        name: patient.name,
        arrivalTime: patient.getFormattedTime(),
        alertLevel: "EMERGENCY",
        message: ` CRITICAL PATIENT ALERT
  - Patient: ${patient.name}
  - Triage Level: 1 (IMMEDIATE ATTENTION REQUIRED)
  - Arrived at: ${patient.getFormattedTime()}
  - Status: URGENT INTERVENTION NEEDED`,
      };

      this.criticalAlerts.push(criticalAlert);

      this.broadcastNotification({
        type: "CRITICAL_PATIENT_ALERT",
        alert: criticalAlert,
        totalCriticalAlerts: this.criticalAlerts.length,
      });

      console.error("==== CRITICAL PATIENT ALERT ====");
      console.error(criticalAlert.message);
      console.error("================================");
    }
  }

  notifyNextPatient() {
    const nextPatient = this.getSortedQueue()[0];
    if (nextPatient) {
      const timeString = nextPatient.getFormattedTime();
      this.broadcastNotification({
        type: "next_patient",
        message: `Next patient: ID ${nextPatient.id} - ${nextPatient.name} (Arrived at ${timeString})`,
        patient: nextPatient.getDetails(),
      });
    }
  }

  getWaitTimeEstimate(triageLevel) {
    const queue = this.getSortedQueue();
    const patientsBefore = queue.filter(
      (p) => p.triageLevel <= triageLevel
    ).length;
    return patientsBefore * 15;
  }

  checkStaffingThreshold() {
    const patientCount = this.patients.size;
    const ratio = patientCount / this.staffCount;
    if (ratio > 4) {
      this.broadcastNotification({
        type: "staffing_alert",
        message: `Patient-to-staff ratio exceeded: ${ratio.toFixed(1)}:1`,
        ratio: ratio,
      });
    }
  }

  getCriticalAlerts() {
    return this.criticalAlerts;
  }

  clearCriticalAlert(patientId) {
    this.criticalAlerts = this.criticalAlerts.filter(
      (alert) => alert.id !== patientId
    );
  }

  addListener(res) {
    this.listeners.add(res);
    res.on("close", () => this.listeners.delete(res));
  }

  broadcastNotification(data) {
    this.listeners.forEach((listener) => {
      listener.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}

module.exports = ERQueue;
