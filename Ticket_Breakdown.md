# Ticket Breakdown

We are a staffing company whose primary purpose is to book Agents at Shifts posted by Facilities on our platform. We're working on a new feature which will generate reports for our client Facilities containing info on how many hours each Agent worked in a given quarter by summing up every Shift they worked. Currently, this is how the process works:

- Data is saved in the database in the Facilities, Agents, and Shifts tables
- A function `getShiftsByFacility` is called with the Facility's id, returning all Shifts worked that quarter, including some metadata about the Agent assigned to each
- A function `generateReport` is then called with the list of Shifts. It converts them into a PDF which can be submitted by the Facility for compliance.

## You've been asked to work on a ticket. It reads:

**Currently, the id of each Agent on the reports we generate is their internal database id. We'd like to add the ability for Facilities to save their own custom ids for each Agent they work with and use that id when generating reports for them.**

Based on the information given, break this ticket down into 2-5 individual tickets to perform. Provide as much detail for each ticket as you can, including acceptance criteria, time/effort estimates, and implementation details. Feel free to make informed guesses about any unknown details - you can't guess "wrong".

You will be graded on the level of detail in each ticket, the clarity of the execution plan within and between tickets, and the intelligibility of your language. You don't need to be a native English speaker, but please proof-read your work.

## Your Breakdown Here

## Ticket 1

### Add Facility agent Repository

Effort estimate: 8 hours <br />

#### Overview / Problem Statement

We have a request from our client to be able to connect agents by their custom id instead of the internally generated id from our DB. The problem might have stemmed from the fact that they already have a system to internally identify their agents and the DB id creates confusion for them.

#### Goal

The goal of this ticket is to add a database layer that allows facility to add readable id for their agents

#### Requirement

- Create a table `facility_agent_identifier` that has the following columns: `agentId`, `facilityId` & `facilityAgentId`
- Make all columns composite keys. We need them this way so that each row can be unique (Basically the `agentId`, `facilityId` & `facilityAgentId` combination should not be duplicated).
- Add a `type`
  ```
  type CreateFacilityAgentIdentifier = {
    agentId: number;
    facilityId: number;
    facilityAgentId: string;
  }
  ```
- Add an interface called `FacilityAgentRepository`. This interface should contain methods:

```
  createMany(vars: CreateFacilityAgentIdentifier[]): Promise<void>;
  findAgentsByFacilityAgentIds(facilityId: number, facilityAgentIds: string[]): Promise<number[]>
```

- Add a method called `validateFacilityAgents(facilityId, agentIds)`. The goal of this method is to make sure that the agents supplied by the facility belong to them. Throw an error if any of the supplied agents does not belong to the facility.

```
  const validateFacilityAgents = async (facilityId, agentIds) => {
    const agents: number[] = (`SELECT agentId FROM agent WHERE facilityId = ${facilityId} AND id IN (...agentIds));
    const uniqueAgentIds = [...new Set(agentIds)];
    if(agents.length !== uniqueAgentIds){
      const unknownIds = uniqueAgentIds.filter((entityId) => !agents.some((agent) => agent.id === entityId));
    throw new EntityNotFoundError(`Unable to find entities with ids: ${unknownIds}.`);
    }

  }

```

- Implement the `FacilityAgentRepository` interface.
- Call the `validateFacilityAgents` function in the `createMany` method to validate input.
  Call the `.save` method of the ORM to save the inputs of `createMany` in the `facility_agent_identifier`.
- Pseudo code for `findAgentsByFacilityAgentIds`

```
  SELECT agentId FROM facility_agent_identifier WHERE facilityId = ${facilityId} AND facilityAgentId IN (...facilityAgentIds)
```

#### Acceptance Criteria

- Add migration that creates the table `facility_agent_identifier` and add all the neccessary colums. Make sure to add all foreign key constraints.
- Add tests for both methods of the `FacilityAgentRepository` interface. Make sure to add enough noise to the tests to make sure the methods works as expected.
- Add tests for `validateFacilityAgents` method

## Ticket 2

### Add Facility Agent Service

Effort estimate: 6 hours <br />
Depends on: Ticket 1

#### Overview / Problem Statement

We already have the repository of the facility agent indentifier in ticket 1. The goal of this ticket is to extend the existing methods to handle the client's new request as stated in ticket 1.

#### Goal

The goal of this ticket is to update existing functions to be able to handle the new agentId inputs from the facility.

#### Requirement

- Update `getShiftsByFacility` add an optional `facilityAgentIds` parameter to the method. We are making this parameter optional because of backwards compatibility.
- If `facilityAgentIds` is supplied, call the `findAgentsByFacilityAgentIds` from ticket 1 to get the `agentIds` else empty array;

```
  const agentIds = !facilityAgentIds ? [] : (await findAgentsByFacilityAgentIds(facilityId, facilityAgentIds))
```

- Update the existing `SQL` query of `getShiftsByFacility` to also find by `agentIds` computed from the previous step.

```
  SELECT shift.id, agent.name,f.facilityAgentId FROM shift
  INNER JOIN agent ON agent.id = shift.agentId
  INNER JOIN facility_agent_identifier f ON f.facilityId = agent.facilityId
  WHERE agent.facilityId = ${facilityId} AND WHERE agent.id IN (...$agentIds)
```

- Make sure we are passing data that contains `facilityAgentId` so that the `generateReport` method uses `facilityAgentId` instead of the DB agent id.

#### Acceptance Criteria

- Add unit tests to make sure the updated method works.
- Make sure that the code works as before when the optional parameter is not supplied.
- Add a snapshot test to `generateReport` to make sure that the report is always consistent.

## Ticket 3

### Add API Layer

Effort estimate: 4 hours <br />

Depends on: Ticket 2

#### Overview / Problem Statement

We want to expose a new endpoint to support saving facility agent indentifier requested by the client in task 1. Also we want to update the api to generate ticket to be able to accept an optional facilityAgentIds so that they can only print report for only the supplied agents

#### Goal

The goal of this ticket is to add endpoints to support creating of agents with readble ids. Also we are updating the generate report endpoint to accept optional agentIds

#### Requirement

- Add a post method `/v1/agent/createMany`. This enpoint is a post request that accepts a request body containing

```
  {
    facilityId: number;
    agents: [
      { agentId: number, facilityAgentId: string}
    ]
  }
```

- Validate the fields sents from the client. Make sure `facilityId` is a number and `agents` is an array containing `{ agentId: number, facilityAgentId: string}`

- Pass the clean fields to the `createMany` function from ticket 1

- Update the generate reports api to accept an optional field called `facilityAgentIds: string[]`. If the optional field is supplied, validate that it's an array of strings
- Pass the optional field to the `getShiftsByFacility` function.

#### Acceptance Criteria

- Return 200 OK when no error occurs
- Return 404 when `EntityNoFoundError`
- Return 500 when internal server error occurs.
- Add tests for the new and existing api
