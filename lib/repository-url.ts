import { createSerializer, parseAsString } from "nuqs/server";

// One place to define what a shared explorer link remembers.
export const repositoryUrlParams = {
  repo: parseAsString.withDefault(""),
  file: parseAsString.withDefault(""),
  q: parseAsString.withDefault(""),
};

export const createRepositoryUrl = createSerializer(repositoryUrlParams);
