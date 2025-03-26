const express = require("express");
const router = express.Router();
const Patient = require("../src/models/patient");
const ERQueue = require("../src/models/erQueue");

const er = new ERQueue();
let patientId = 1;

router.post("/patients", (req, res) => {
  try {
    const { name, triageLevel } = req.body;

    if (!name || !triageLevel) {
      return res
        .status(400)
        .json({ error: "Name and triageLevel are required" });
    }

    if (!Number.isInteger(triageLevel) || triageLevel < 1 || triageLevel > 5) {
      return res.status(400).json({ error: "TriageLevel must be 1-5" });
    }

    const patient = new Patient(patientId++, name, triageLevel);
    er.addPatient(patient);

    er.checkStaffingThreshold();
    er.notifyNextPatient();

    res.status(201).json({
      patient: patient.getDetails(),
      waitTimeEstimate: er.getWaitTimeEstimate(triageLevel),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/queue", (req, res) => {
  try {
    const queue = er.getSortedQueue();
    res.json(queue.map((patient) => patient.getDetails()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/patients/:id/treat", (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patient = er.patients.get(patientId);

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const sortedQueue = er.getSortedQueue();
    const nextPatientInQueue = sortedQueue[0];

    if (
      nextPatientInQueue &&
      nextPatientInQueue.triageLevel === 1 &&
      patient.triageLevel !== 1
    ) {
      return res.status(403).json({
        error:
          "Cannot treat this patient. A critical (Level 1) patient is waiting.",
        criticalPatientId: nextPatientInQueue.id,
      });
    }

    if (patient.status !== "waiting") {
      return res.status(400).json({ error: "Patient not in waiting status" });
    }

    patient.status = "treating";
    er.treatingCount++;

    er.broadcastNotification({
      type: "status_update",
      patientId,
      newStatus: "treating",
    });

    er.notifyNextPatient();

    res.json(patient.getDetails());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/patients/:id/discharge", (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patient = er.patients.get(patientId);

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    if (patient.status !== "treating") {
      return res.status(400).json({ error: "Patient not being treated" });
    }

    er.clearCriticalAlert(patientId);

    patient.status = "discharged";
    er.treatingCount--;
    er.patients.delete(patientId);

    er.broadcastNotification({
      type: "patient_discharged",
      patientId,
      remainingCriticalAlerts: er.getCriticalAlerts().length,
    });

    er.notifyNextPatient();

    res.json({
      message: "Patient discharged successfully",
      remainingCriticalAlerts: er.getCriticalAlerts().length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/critical-alerts", (req, res) => {
  try {
    const criticalAlerts = er.getCriticalAlerts();
    res.json({
      totalCriticalAlerts: criticalAlerts.length,
      alerts: criticalAlerts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
