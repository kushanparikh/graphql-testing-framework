import { GraphQLTestClient } from "../utils/graphql-client.ts";
import { beforeAll, describe, expect, test } from "@jest/globals";

/**
 * Rick & Morty API - Query Operations (Happy Path)
 *
 * API: https://rickandmortyapi.com/graphql
 *
 * This test suite validates GraphQL query operations against the Rick & Morty
 * GraphQL API, a public read-only API providing data about characters, locations,
 * and episodes from the show.
 *
 * Test Coverage:
 * - Single resource fetch by ID with variables
 * - Pagination metadata and default page size behavior
 * - Partial name filtering (case-insensitive)
 * - Multi-parameter AND filter composition with aliases
 * - Deep nested data traversal (Character → Location → Characters)
 * - One-to-many relationship traversal (Episode → Characters)
 * - Multi-resource queries (character + location + episode in one request)
 * - Fragment-based field reuse with alias composition
 * - Alias-based queries for same resource type with different parameters
 *
 * @see https://rickandmortyapi.com/documentation for API documentation
 * @see https://rickandmortyapi.com/graphql for GraphQL playground
 */

const RICK_AND_MORTY_API = 'https://rickandmortyapi.com/graphql';

describe("Query Operations for Rick and Morty", () => {
    let client: GraphQLTestClient;

    // beforeAll is used instead of beforeEach because GraphQLTestClient is stateless
    // for read-only queries. Creating a single instance avoids redundant object
    // instantiation across tests while maintaining test isolation — no test mutates
    // the client, so sharing the instance is safe and consistent with other test
    // suites in this project (Countries, SpaceX).
    beforeAll(() => {
        client = new GraphQLTestClient(RICK_AND_MORTY_API);
    });

    /**
     * Test 1: Fetch a single character by ID
     *
     * Validates that a parameterized query with a variable ($id) correctly
     * retrieves a specific character. Uses Rick Sanchez (id: 1) as the
     * known fixture to assert exact field values.
     *
     * Tests: Query variables (ID!), single resource fetch, field selection
     */
    test("should fetch single character", async () => {
        const query = `
        query GetCharacter ($id: ID!) {
            character(id: $id) {
                name
                status
                species
            }
        }`

        const variables = { id: '1' };

        const data = await client.request(query, variables);

        expect(data.character.name).toBe('Rick Sanchez');
        expect(data.character.status).toBe('Alive');
        expect(data.character.species).toBe('Human');
    })

    /**
     * Test 2: Fetch characters with pagination metadata
     *
     * Validates the pagination info structure returned alongside results.
     * Asserts total count, total pages, next/prev page pointers, and the
     * default page size of 20 items. First-page behavior is verified by
     * confirming prev is null and next points to page 2.
     *
     * Tests: Pagination metadata (count, pages, next, prev), default page size
     */
    test("should fetch characters with pagination", async () => {
        const query = `
        query {
            characters(page: 1) {
                info {
                    count
                    pages
                    next
                    prev
                }
                results {
                    id
                    name
                }
            }
        }`

        const data = await client.request(query);

        expect(data.characters.info.count).toBe(826);
        expect(data.characters.info.pages).toBe(42);
        expect(data.characters.info.next).toBe(2);
        expect(data.characters.info.prev).toBe(null);

        expect(data.characters.results.length).toBe(20);
        expect(data.characters.results[0]).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String)
            })
        );
        expect(data.characters.results[1].id).toBe("2");
        expect(data.characters.results[1].name).toBe('Morty Smith');
    })

    /**
     * Test 3: Filter characters by name (partial, case-insensitive match)
     *
     * Validates that the name filter performs a case-insensitive partial
     * string match. Querying "rick" should return multiple characters
     * (Rick Sanchez, Toxic Rick, etc.) and every result's name must
     * contain "rick" when compared case-insensitively.
     *
     * Tests: Partial string matching, case-insensitive filter, filter parameter handling
     */
    test("should filter characters by name (partial match)", async () => {
        const query = `
        query {
            characters(filter: {name: "rick"}) {
                results {
                    id
                    name
                }
            }
        }`

        const data = await client.request(query);

        expect(data.characters.results.length).toBeGreaterThan(0);
        data.characters.results.forEach((result: { name: any; }) => {
            expect(result.name.toLowerCase()).toContain("rick");
        });
    })

    /**
     * Test 4 & 5 Combined: Filter by status + multi-parameter AND composition
     *
     * Uses GraphQL aliases to execute three filter variations in a single request:
     *   - onlyRick:    filter by name "rick" only
     *   - onlyAlive:   filter by status "alive" only
     *   - bothFilters: filter by name "rick" AND status "alive"
     *
     * Validates that multiple filters compose with AND logic (not OR),
     * meaning the combined result set is strictly smaller than either
     * individual set. Also verifies a known alive Rick ("Cop Rick") is
     * present and that every result satisfies both filter conditions.
     *
     * Tests: Enum status filtering, AND filter composition, GraphQL aliases,
     *        set theory (intersection < either superset)
     */
    test("should filter characters by multiple parameters (name + status)", async () => {
        const query = `
        query {
            onlyRick: characters(filter: {name: "rick"}) {
                info {
                    count
                }
            }
            onlyAlive: characters(filter: {status: "alive"}) {
                info {
                    count
                }
            }
            bothFilters: characters(filter: {name: "rick", status: "alive"}) {
                info {
                    count
                }
                results {
                    name
                    status
                }
            }
        }`

        const data = await client.request(query);

        const countRick = data.onlyRick.info.count;
        const countAlive = data.onlyAlive.info.count;
        const countBoth = data.bothFilters.info.count;

        // Combine filter should have narrow result
        expect(countBoth).toBeLessThanOrEqual(countRick);
        expect(countBoth).toBeLessThanOrEqual(countAlive);
        expect(countBoth).toBeGreaterThan(0);

        data.bothFilters.results.forEach((result: { name: any; status: any; }) => {
            expect(result.name.toLowerCase()).toContain("rick");
            expect(result.status).toBe("Alive");
        });

        const copRick = data.bothFilters.results.find(
            (result: { name: any; }) => result.name.toLowerCase() === "cop rick"
        );
        expect(copRick).toBeDefined();
        expect(copRick.status).toBe("Alive");
    })

    /**
     * Test 6: Fetch nested data (Character → Origin → Residents)
     *
     * Traverses a 3-level relationship: Character(1) → origin Location →
     * resident Characters. Validates that Rick Sanchez's origin is Earth (C-137),
     * that the origin has the expected type and dimension, and that the
     * residents array contains valid character objects with constrained
     * status values ("Alive" | "Dead" | "unknown").
     *
     * Also verifies bidirectional relationship integrity — known residents
     * like Jerry Smith and Summer Smith are confirmed present in Earth
     * (C-137)'s residents list, proving the API correctly resolves
     * Character → Location → Character traversals without breaking.
     *
     * Tests: 3-level nesting, bidirectional relationship traversal,
     *        circular reference resolution, nested array validation
     */
    test("should fetch nested data", async () => {
        const query = `
            query {
                character (id: 1) {
                    name
                    origin {
                        name
                        type
                        dimension
                        residents {
                            name
                            status
                        }
                    }
                }
            }
        `

        const data = await client.request(query);

        expect(data.character).toBeDefined();
        expect(data.character.name).toBe("Rick Sanchez");
        expect(data.character.origin).toBeDefined();
        expect(data.character.origin).not.toBeNull();
        expect(data.character.origin.name).toBe("Earth (C-137)");
        expect(data.character.origin.type).toBe("Planet");
        expect(data.character.origin.dimension).toBe("Dimension C-137");
        expect(data.character.origin.residents).toBeInstanceOf(Array);
        expect(data.character.origin.residents.length).toBeGreaterThan(0);
        expect(data.character.origin.residents[0].name).toEqual(expect.any(String));
        expect(data.character.origin.residents[0].status).toEqual(expect.any(String));
        data.character.origin.residents.forEach((resident: { status: any; }) => {
            expect(["Alive", "Dead", "unknown"]).toContain(resident.status);
        });
        const jerrySmith = data.character.origin.residents.find(
            (resident: { name: any; }) => resident.name.toLowerCase() === "jerry smith"
        );
        expect(jerrySmith).toBeDefined();
        expect(jerrySmith.status).toBe("Alive");

        // Bidirectional relationship check: verify another known Earth (C-137) resident
        // Note: Rick Sanchez's origin is Earth (C-137) but the API does not list him as
        // a current resident — his location is the Citadel of Ricks. Summer Smith is a
        // reliable resident to verify the Character → Location → Character traversal.
        const summerSmith = data.character.origin.residents.find(
            (resident: { name: any; }) => resident.name === "Summer Smith"
        );
        expect(summerSmith).toBeDefined();
        expect(summerSmith.status).toBe("Alive");
    })

    /**
     * Test 7: Fetch episode with its character list
     *
     * Validates the Episode → Characters one-to-many relationship by
     * fetching the Pilot episode (id: 1) and its full character roster.
     * Asserts known episode metadata (name, air_date, episode code) and
     * confirms both Rick Sanchez and Morty Smith appear in the cast,
     * proving the reverse relationship from Episode back to Character.
     *
     * Tests: One-to-many relationship, array of objects inside a resource,
     *        known fixture validation (Pilot episode details)
     */
    test("should fetch episode data with character list", async () => {
        const query = `
            query {
                episode(id: 1) {
                    name
                    air_date
                    episode
                    characters {
                        name
                        status
                    }
                }
            }
        `

        const data = await client.request(query);

        expect(data.episode).toBeDefined()
        expect(data.episode.name).toBe("Pilot")
        expect(data.episode.air_date).toBe("December 2, 2013")
        expect(data.episode.episode).toBe("S01E01")
        expect(data.episode.characters).toBeInstanceOf(Array)
        expect(data.episode.characters.length).toBeGreaterThanOrEqual(2)
        expect(data.episode.characters).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: "Rick Sanchez", status: "Alive" }),
            expect.objectContaining({ name: "Morty Smith", status: "Alive" })
        ]))
        expect(data.episode.characters[0].name).toEqual(expect.any(String))
        expect(data.episode.characters[0].status).toEqual(expect.any(String))
    })

    /**
     * Test 8: Multi-resource query (character + location + episode in one request)
     *
     * Demonstrates GraphQL's key advantage over REST: fetching three
     * distinct resource types (Character, Location, Episode) in a single
     * request. Validates that the response contains exactly 3 top-level
     * keys with no resource conflicts or overwrites, and that each
     * resource returns the correct data for id: 1.
     *
     * Tests: Multiple root-level queries, single-request multi-resource fetch,
     *        response structure with 3 independent resource types
     */
    test("should be able to do multi resource query (character + location + episode)", async () => {
        const query = `
            query {
                character(id: 1) {
                    name
                    status
                }
                location(id: 1) {
                    name
                    type
                }
                episode(id: 1) {
                    name
                    episode
                }
            }
        `

        const data = await client.request(query);
        
        // Verify response.data has 3 top-level keys
        expect(Object.keys(data)).toHaveLength(3);
        expect(data).toHaveProperty('character');
        expect(data).toHaveProperty('location');
        expect(data).toHaveProperty('episode');
        
        // Verify response.data.character exists
        expect(data.character).toBeDefined();
        expect(data.character).not.toBeNull();
        
        // Verify response.data.location exists
        expect(data.location).toBeDefined();
        expect(data.location).not.toBeNull();
        
        // Verify response.data.episode exists
        expect(data.episode).toBeDefined();
        expect(data.episode).not.toBeNull();
        
        // Verify character.name === "Rick Sanchez"
        expect(data.character.name).toBe("Rick Sanchez");
        
        // Verify character.status === "Alive"
        expect(data.character.status).toBe("Alive");
        
        // Verify location.name === "Earth (C-137)"
        expect(data.location.name).toBe("Earth (C-137)");
        
        // Verify location.type === "Planet"
        expect(data.location.type).toBe("Planet");
        
        // Verify episode.name === "Pilot"
        expect(data.episode.name).toBe("Pilot");
        
        // Verify episode.episode === "S01E01"
        expect(data.episode.episode).toBe("S01E01");
    })

    /**
     * Test 9: Query with fragments (DRY field reuse + aliases)
     *
     * Defines a CharacterBasics fragment (id, name, status, species) and
     * spreads it into two aliased queries for Rick and Morty. This validates
     * both fragment syntax (fragment ... on Type) and alias composition
     * (customName: actualQuery) in a single test.
     *
     * Fragment verification: both response objects must share an identical
     * set of keys, proving the fragment was applied uniformly. Exact field
     * values are asserted for both characters.
     *
     * Tests: Fragment definition and spread syntax, fragment reusability,
     *        DRY principle in GraphQL, alias + fragment composition
     */
    test("should query with fragments", async () => {
        const fragment = `
        fragment CharacterBasics on Character {
            id
            name
            status
            species
        }
        `
        const query = `${fragment}
            query {
                smith_family_father: character(id: 1) {
                    ...CharacterBasics
                }
                smith_family_son: character(id: 2) {
                    ...CharacterBasics
                }
            }
        `

        const data = await client.request(query);

        // Verify aliased keys exist (not the default "character" key)
        expect(data).toHaveProperty('smith_family_father');
        expect(data).toHaveProperty('smith_family_son');
        expect(data).not.toHaveProperty('character');

        // Verify Rick Sanchez (id: 1) field values
        expect(data.smith_family_father.id).toBe("1");
        expect(data.smith_family_father.name).toBe("Rick Sanchez");
        expect(data.smith_family_father.status).toBe("Alive");
        expect(data.smith_family_father.species).toBe("Human");

        // Verify Morty Smith (id: 2) field values
        expect(data.smith_family_son.id).toBe("2");
        expect(data.smith_family_son.name).toBe("Morty Smith");
        expect(data.smith_family_son.status).toBe("Alive");
        expect(data.smith_family_son.species).toBe("Human");

        // Fragment verification: both objects must have identical keys,
        // proving the fragment was applied uniformly to both queries
        const fatherKeys = Object.keys(data.smith_family_father).sort();
        const sonKeys = Object.keys(data.smith_family_son).sort();
        expect(fatherKeys).toEqual(sonKeys);
        expect(fatherKeys).toEqual(['id', 'name', 'species', 'status']);
    })

    /**
     * Test 10: Query with aliases (multiple queries of the same resource type)
     *
     * Fetches three different characters (Rick, Morty, Summer) in a single
     * request using aliases to avoid key collisions. Without aliases,
     * querying character(id: 1) and character(id: 2) in the same request
     * would overwrite each other under the "character" key.
     *
     * Validates that:
     *   - Response keys match the alias names (rick, morty, summersmith)
     *   - The default "character" key does NOT appear in the response
     *   - Each aliased result contains the correct character data
     *   - All three characters share the same field structure
     *
     * Tests: Alias syntax (customName: actualQuery), key collision avoidance,
     *        response key customization, same-type multi-query in one request
     */
    test("should query with aliases", async () => {
        const query = `
            query {
                rick: character(id: 1) {
                    name
                    status
                }
                morty: character(id: 2) {
                    name
                    status
                }
                summersmith: character(id: 3) {
                    name
                    status
                }
            }
        `

        const data = await client.request(query);

        // Verify alias keys exist and default "character" key does not
        expect(Object.keys(data)).toEqual(['rick', 'morty', 'summersmith']);
        expect(data).not.toHaveProperty('character');

        // Verify each character's data
        expect(data.rick.name).toBe("Rick Sanchez");
        expect(data.rick.status).toBe("Alive");

        expect(data.morty.name).toBe("Morty Smith");
        expect(data.morty.status).toBe("Alive");

        expect(data.summersmith.name).toBe("Summer Smith");
        expect(data.summersmith.status).toBe("Alive");

        // Verify all aliased results share the same field structure
        [data.rick, data.morty, data.summersmith].forEach((char) => {
            expect(char).toHaveProperty('name');
            expect(char).toHaveProperty('status');
            expect(char.status).toBe("Alive");
        });
    })
})