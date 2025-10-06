// graphql/forum.ts

// Optional fragment to avoid repeating fields
const ROUTE_FIELDS = `
  fragment RouteFields on Route {
    routeId
    userId
    title
    description
    sharable
    createdAt
    updatedAt
    locations {
      placeId
      isOnTheRoute
      latitude
      longitude
    }
  }
`;

export const GET_SHARABLE_ROUTES = /* GraphQL */ `
  ${ROUTE_FIELDS}
  query GetSharableRoutes {
    getAllRoutes {
      ...RouteFields
    }
  }
`;

export const GET_USER_ROUTES = /* GraphQL */ `
  ${ROUTE_FIELDS}
  query GetUserRoutes($userId: ID!) {
    getUserRoutes(userId: $userId) {
      ...RouteFields
    }
  }
`;

export const GENERATE_SIGNED_URL = /* GraphQL */ `
  mutation GenerateSignedUrl($type: String!, $id: ID!, $mode: String!) {
    generateSignedUrl(type: $type, id: $id, mode: $mode) {
      url
      key
    }
  }
`;

export const UPDATE_ROUTE = /* GraphQL */ `
  ${ROUTE_FIELDS}
  mutation UpdateRoute($routeId: ID!, $input: RouteInput!) {
    updateRoute(routeId: $routeId, input: $input) {
      ...RouteFields
    }
  }
`;

export const CREATE_ROUTE = /* GraphQL */ `
  ${ROUTE_FIELDS}
  mutation CreateRoute($input: RouteInput!) {
    createRoute(input: $input) {
      ...RouteFields
    }
  }
`;
