const generarMatricula = () => {
  const randomNumber = Math.floor(Math.random() * 100000000);
  const paddedNumber = randomNumber.toString().padStart(8, "0");
  const matricula = `A${paddedNumber}`;
  return matricula;
};

describe("Probar la funcionalidad de login", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/BighornSheep/login");
  });

  it("Probar signup con datos nuevos y validos", () => {
    cy.wait(1000);
    cy.contains("Registro").click();
    cy.get("#username").type(generarMatricula());
    cy.get("#password").type("Cuilty1!");
    cy.get("#confirm_pwd").type("Cuilty1!");
    cy.get(".flex.items-center > .inline-flex").click();
    cy.wait(4000);
  });

  it("Probar signup con datos con matricula ya en bd", () => {
    cy.wait(1000);
    cy.contains("Registro").click();
    cy.get("#username").type("A01721636");
    cy.get("#password").type("Cuilty1!");
    cy.get("#confirm_pwd").type("Cuilty1!");
    cy.get(".flex.items-center > .inline-flex").click();
    cy.wait(4000);
  });

  it("Probar signup sin datos", () => {
    cy.wait(1000);
    cy.contains("Registro").click();
    cy.get(".flex.items-center > .inline-flex").should("be.disabled");
    cy.wait(4000);
  });

  it("Probar signup sin password", () => {
    cy.wait(1000);
    cy.contains("Registro").click();
    cy.get("#username").type(generarMatricula());
    cy.get(".flex.items-center > .inline-flex").should("be.disabled");
    cy.wait(4000);
  });

  it("Probar signup sin confirmacion de password", () => {
    cy.wait(1000);
    cy.contains("Registro").click();
    cy.get("#username").type(generarMatricula());
    cy.get("#password").type("Cuilty1!");
    cy.get(".flex.items-center > .inline-flex").should("be.disabled");
    cy.wait(4000);
  });

  it("Probar signup con password no coincidente", () => {
    cy.wait(1000);
    cy.contains("Registro").click();
    cy.get("#username").type(generarMatricula());
    cy.get("#password").type("Cuilty1!");
    cy.get("#confirm_pwd").type("Cuilty2!");
    cy.get(".flex.items-center > .inline-flex").should("be.disabled");
    cy.wait(4000);
  });
});
