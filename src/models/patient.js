class Patient {
  constructor(id, name, triageLevel, arrivalTime = Date.now()) {
    this.id = id;
    this.name = name;
    this.triageLevel = triageLevel;
    this.arrivalTime = new Date(arrivalTime);
    this.status = "waiting";
  }

  getFormattedTime() {
    return `${this.arrivalTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${this.arrivalTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  getDetails() {
    return {
      id: this.id,
      name: this.name,
      triageLevel: this.triageLevel,
      status: this.status,
      arrivalTime: this.getFormattedTime(),
    };
  }
}

module.exports = Patient;
