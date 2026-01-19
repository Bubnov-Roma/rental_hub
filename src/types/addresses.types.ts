const ADDRESS_PREFIXES = [
	"applicationData.addresses.registration",
	"applicationData.addresses.actual",
] as const;

export type AddressFieldPrefix = (typeof ADDRESS_PREFIXES)[number];

export type AddressFieldPath =
	| `${AddressFieldPrefix}.index`
	| `${AddressFieldPrefix}.country`
	| `${AddressFieldPrefix}.region`
	| `${AddressFieldPrefix}.city`
	| `${AddressFieldPrefix}.address`;
