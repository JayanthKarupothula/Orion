import { Environment } from "@/services/entity/controllers/Environment/models/Environment";
import { Badge, Card, Container, Placeholder } from "react-bootstrap";
import { BsEmojiFrown } from "react-icons/bs";
import { MdDangerous } from "react-icons/md";

/**
 * @file - EngineInstancesCommons.view.tsx
 * @description - this file contains the common functions and components used in the EngineInstances Groups and EngineInstnaces Standalone view
 */

/**
 *@description - this function is used to get the subview styles for subview of the engine instances
 * @returns - subview styles
 */
export function getSubViewStyles() {
  return {
    borderRadius: "0px",
    marginTop: "-4.5px",
  };
}

/**
 *
 * @returns - error message when the engine instances are not fetched
 */
export function renderError() {
  return (
    <p className={"noResults"}>
      <MdDangerous size={30} /> <br /> <br />
      <Badge bg="danger">Error</Badge> Couldn&apos;t grab Engine Instances.
    </p>
  );
}

/**
 * @description - this function is used to render the no results found message
 * @param search - search string
 * @returns - no results found message
 */
export function renderNoResults(search: string) {
  return (
    <Container>
      <p className={"noResults"}>
        <BsEmojiFrown size={30} /> <br /> <br />
        Sorry, we could&apos;t find any results for &apos;{search}&apos;
      </p>
    </Container>
  );
}

/**
 * @description - this function is used to render the loading card
 * @returns
 */
export function renderLoadingCard() {
  return (
    <>
      <br />
      <Card style={{ width: "18rem", display: "flex", margin: "0 auto" }}>
        <Card.Body>
          <Placeholder animation="glow" as={Card.Title}>
            <Placeholder xs={6} />
          </Placeholder>
          <Placeholder animation="glow" as={Card.Text}>
            <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /> <Placeholder xs={6} />{" "}
            <Placeholder xs={8} />
          </Placeholder>
          <Placeholder.Button variant="primary" xs={6} />
        </Card.Body>
      </Card>
    </>
  );
}

/**
 * @description - this function returns the tags of the engine
 * @param tags
 * @returns
 */
export const getTagNames = (tags: any[]): string[] => {
  if (!tags || tags.length === 0) {
    return ["No tags found."];
  }
  return tags.map((tag) => tag.name);
};

/**
 * @description - this function generates the environment (dev, sit, qa,uat, Prod) of a engine instance based on the envid
 * @param envId-  environment id of the engine instance
 * @param envOptions - list of environments from DB
 * @returns
 */
export const generateEnv = (envId: string, envOptions: Environment[]) => {
  let envName = "";
  // eslint-disable-next-line
  envOptions.map((env) => {
    if (env.id === envId) {
      envName = env.name;
    }
  });
  return envName;
};
