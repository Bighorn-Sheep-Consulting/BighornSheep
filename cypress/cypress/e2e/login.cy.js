describe("Probar la funcionalidad de login", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/BighornSheep/login");
  });

  it("Probar login con credenciales correctas", () => {
    cy.wait(1000);
    cy.get("#username").type("A555");
    cy.get("#password").type("Cuilty1!");
    cy.get(".flex.items-center > .inline-flex").click();
    cy.wait(4000);
  });

  it("Probar login con password incorrecto", () => {
    cy.wait(1000);
    cy.get("#username").type("A444");
    cy.get("#password").type("FakePassword123!");
    cy.get(".flex.items-center > .inline-flex").click();
    cy.wait(4000);
  });

  it("Probar login con username incorrecto", () => {
    cy.wait(1000);
    cy.get("#username").type("2351512253");
    cy.get("#password").type("password123!");
    cy.get(".flex.items-center > .inline-flex").click();
    cy.wait(4000);
  });

  it("Probar sin password", () => {
    cy.wait(1000);
    cy.get("#username").type("A555");
    cy.get(".flex.items-center > .inline-flex").click();
    cy.wait(4000);
  });

  it("Probar sin username", () => {
    cy.wait(1000);
    cy.get("#password").type("password123!");
    cy.get(".flex.items-center > .inline-flex").click();
    cy.wait(4000);
  });

  it("Probar sin username ni password", () => {
    cy.wait(1000);
    cy.get(".flex.items-center > .inline-flex").click();
    cy.wait(4000);
  });
});
