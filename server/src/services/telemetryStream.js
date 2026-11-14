const { Subject } = require('rxjs');

const telemetrySubject = new Subject();

const pushTelemetry = (dataPoint) => {
  telemetrySubject.next(dataPoint);
};

module.exports = { telemetrySubject, pushTelemetry };
