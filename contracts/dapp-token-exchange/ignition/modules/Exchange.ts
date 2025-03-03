import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ExchangeModule = buildModule("ExchangeModule", (m) => {
  const feeAccount = m.getParameter("feeAccount", m.getAccount(0));
  const feePercent = m.getParameter("feePercent", 3);

  const exchange = m.contract("Exchange", [feeAccount, feePercent]);

  return { exchange };
});

export default ExchangeModule;
