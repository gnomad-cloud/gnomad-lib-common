type SchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object"
  | "null";

interface Schema {
  type: SchemaType;
  properties?: Record<string, Schema>;
  items?: Schema;
}

function validateData(data: any, schema: Schema): boolean {
  if (Array.isArray(schema.type)) {
    console.log("%s []-> %s", schema.type, typeof data)
    return (
      Array.isArray(data) &&
      data.every((item) => validateData(item, (schema.type as any)[0]))
    );
  } else if (schema.type === "object") {
    console.log("%s {}=> %s", schema.type, typeof data)
    if (typeof data !== "object" || data === null) {
      return false;
    }
    const schemaProps = schema.properties || {};
    const dataProps = Object.keys(data);
    console.log("%s {}[]=> %s", Object.keys(schemaProps), typeof data)
    const validated = dataProps.every((prop) => {
        console.log("%s *=> %o", schemaProps[prop], data[prop])
        return validateData(data[prop], schemaProps[prop] || { type: "null" })
    })
    console.log("{}[]=> %s", validated)

    return (dataProps.length >= Object.keys(schemaProps).length && validated);
    } else {
        console.log("%s -> %s == %s", typeof data == schema.type , typeof data, schema.type)
        return typeof data == schema.type;
    }
    console.log("[*]")
}

function jsonToSchema(jsonData: any): Schema {
  if (Array.isArray(jsonData)) {
    if (jsonData.length > 0) {
      return {
        type: 'array',
        // enum: jsonToSchema(jsonData[0]).type,
      };
    } else {
      return {
        type: "array",
      };
    }
  } else if (typeof jsonData === "object" && jsonData !== null) {
    const schema: Schema = {
      type: "object",
      properties: {},
    };
    for (const [key, value] of Object.entries(jsonData)) {
      if (schema.properties) schema.properties[key] = jsonToSchema(value);
    }
    return schema;
  } else {
    const schema: Schema = {
      type: typeof jsonData as SchemaType,
    };
    return schema;
  }
}

const jsonData = {
  name: "John Doe",
  age: 30,
  isStudent: true,
  hobbies: ["reading", "running"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
  },
};

const schema = jsonToSchema(jsonData);

console.log(JSON.stringify(schema, null, 2));
console.log(validateData(jsonData, schema));
