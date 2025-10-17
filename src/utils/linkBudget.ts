/**
 * Link Budget and ERP calculations for RF systems
 */

/**
 * Convert watts to dBm
 * @param watts - Power in watts
 * @returns Power in dBm
 */
export function wattsTodBm(watts: number): number {
  return 10 * Math.log10(watts * 1000);
}

/**
 * Convert dBm to watts
 * @param dBm - Power in dBm
 * @returns Power in watts
 */
export function dBmToWatts(dBm: number): number {
  return Math.pow(10, dBm / 10) / 1000;
}

/**
 * Convert dBd to dBi
 * @param dBd - Gain in dBd (relative to dipole)
 * @returns Gain in dBi (relative to isotropic)
 */
export function dBdTodBi(dBd: number): number {
  return dBd + 2.15;
}

/**
 * Convert dBi to dBd
 * @param dBi - Gain in dBi (relative to isotropic)
 * @returns Gain in dBd (relative to dipole)
 */
export function dBiTodBd(dBi: number): number {
  return dBi - 2.15;
}

/**
 * Calculate Effective Radiated Power (ERP)
 * @param txPowerDBm - Transmitter power in dBm
 * @param antennaGainDBi - Antenna gain in dBi
 * @param cableLossdB - Cable/feeder loss in dB
 * @returns ERP in dBm
 */
export function calculateERP(
  txPowerDBm: number,
  antennaGainDBi: number,
  cableLossdB: number
): number {
  return txPowerDBm + antennaGainDBi - cableLossdB;
}

/**
 * Calculate received power at the other end of the link
 * @param erpDBm - Effective Radiated Power in dBm
 * @param fsplDB - Free Space Path Loss in dB
 * @param rxAntennaGainDBi - Receiver antenna gain in dBi
 * @param rxCableLossdB - Receiver cable loss in dB
 * @returns Received power in dBm
 */
export function calculateReceivedPower(
  erpDBm: number,
  fsplDB: number,
  rxAntennaGainDBi: number,
  rxCableLossdB: number
): number {
  return erpDBm - fsplDB + rxAntennaGainDBi - rxCableLossdB;
}

/**
 * Calculate complete link budget for both directions
 * @param pointA - Point A (transmitter) parameters
 * @param pointB - Point B (receiver) parameters
 * @param fsplDB - Free Space Path Loss in dB
 * @returns Link budget results for both directions
 */
export function calculateLinkBudget(
  pointA: {
    txPowerDBm: number;
    antennaGainDBi: number;
    cableLossdB: number;
  },
  pointB: {
    txPowerDBm: number;
    antennaGainDBi: number;
    cableLossdB: number;
  },
  fsplDB: number
): {
  aToB: {
    erpDBm: number;
    erpWatts: number;
    receivedPowerDBm: number;
    receivedPowerWatts: number;
  };
  bToA: {
    erpDBm: number;
    erpWatts: number;
    receivedPowerDBm: number;
    receivedPowerWatts: number;
  };
} {
  // A to B direction
  const erpA = calculateERP(
    pointA.txPowerDBm,
    pointA.antennaGainDBi,
    pointA.cableLossdB
  );
  const rxPowerB = calculateReceivedPower(
    erpA,
    fsplDB,
    pointB.antennaGainDBi,
    pointB.cableLossdB
  );

  // B to A direction
  const erpB = calculateERP(
    pointB.txPowerDBm,
    pointB.antennaGainDBi,
    pointB.cableLossdB
  );
  const rxPowerA = calculateReceivedPower(
    erpB,
    fsplDB,
    pointA.antennaGainDBi,
    pointA.cableLossdB
  );

  return {
    aToB: {
      erpDBm: erpA,
      erpWatts: dBmToWatts(erpA),
      receivedPowerDBm: rxPowerB,
      receivedPowerWatts: dBmToWatts(rxPowerB),
    },
    bToA: {
      erpDBm: erpB,
      erpWatts: dBmToWatts(erpB),
      receivedPowerDBm: rxPowerA,
      receivedPowerWatts: dBmToWatts(rxPowerA),
    },
  };
}
