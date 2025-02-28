// cypress/e2e/websocket.cy.ts
describe('WebSocket Connection', () => {
    it('connects to the WebSocket and receives data', () => {
      cy.visit('/'); // Visit your main page
  
      // Intercept the WebSocket connection.  This is a *good practice*,
      // even if we don't directly manipulate the connection in this
      // simple test. It helps verify that the connection is being
      // established to the correct URL.
      cy.intercept('ws://100.99.242.6:8000/ws').as('wsConnect');
  
      // Wait for the connection to be established.
      cy.wait('@wsConnect');
  
      // Assert that the "Waiting for data..." text disappears,
      // which indicates that data has been received. This is a *very*
      // basic assertion, but it's a good starting point.
      cy.contains('Waiting for data...', { timeout: 10000 }).should('not.exist');
  
      // You'll add more assertions here later, to verify the
      // *content* of the visualization, once you've confirmed that
      // the basic connection is working.
    });
  });