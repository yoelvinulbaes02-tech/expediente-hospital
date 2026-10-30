
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model Patient
 * 
 */
export type Patient = $Result.DefaultSelection<Prisma.$PatientPayload>
/**
 * Model Episode
 * 
 */
export type Episode = $Result.DefaultSelection<Prisma.$EpisodePayload>
/**
 * Model Allergy
 * 
 */
export type Allergy = $Result.DefaultSelection<Prisma.$AllergyPayload>
/**
 * Model Note
 * 
 */
export type Note = $Result.DefaultSelection<Prisma.$NotePayload>
/**
 * Model VitalSign
 * 
 */
export type VitalSign = $Result.DefaultSelection<Prisma.$VitalSignPayload>
/**
 * Model Handoff
 * 
 */
export type Handoff = $Result.DefaultSelection<Prisma.$HandoffPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  RESIDENT: 'RESIDENT',
  NURSE: 'NURSE',
  LAB: 'LAB',
  READONLY: 'READONLY'
};

export type Role = (typeof Role)[keyof typeof Role]


export const HandoffStatus: {
  PENDIENTE: 'PENDIENTE',
  ACEPTADO: 'ACEPTADO'
};

export type HandoffStatus = (typeof HandoffStatus)[keyof typeof HandoffStatus]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type HandoffStatus = $Enums.HandoffStatus

export const HandoffStatus: typeof $Enums.HandoffStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.patient`: Exposes CRUD operations for the **Patient** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Patients
    * const patients = await prisma.patient.findMany()
    * ```
    */
  get patient(): Prisma.PatientDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.episode`: Exposes CRUD operations for the **Episode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Episodes
    * const episodes = await prisma.episode.findMany()
    * ```
    */
  get episode(): Prisma.EpisodeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.allergy`: Exposes CRUD operations for the **Allergy** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Allergies
    * const allergies = await prisma.allergy.findMany()
    * ```
    */
  get allergy(): Prisma.AllergyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.note`: Exposes CRUD operations for the **Note** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notes
    * const notes = await prisma.note.findMany()
    * ```
    */
  get note(): Prisma.NoteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.vitalSign`: Exposes CRUD operations for the **VitalSign** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VitalSigns
    * const vitalSigns = await prisma.vitalSign.findMany()
    * ```
    */
  get vitalSign(): Prisma.VitalSignDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.handoff`: Exposes CRUD operations for the **Handoff** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Handoffs
    * const handoffs = await prisma.handoff.findMany()
    * ```
    */
  get handoff(): Prisma.HandoffDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.10.1
   * Query Engine version: d1b3f377ca835d73fd50954a5e22128b9ebdd6b8
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    AuditLog: 'AuditLog',
    Patient: 'Patient',
    Episode: 'Episode',
    Allergy: 'Allergy',
    Note: 'Note',
    VitalSign: 'VitalSign',
    Handoff: 'Handoff'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "auditLog" | "patient" | "episode" | "allergy" | "note" | "vitalSign" | "handoff"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      Patient: {
        payload: Prisma.$PatientPayload<ExtArgs>
        fields: Prisma.PatientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PatientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PatientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          findFirst: {
            args: Prisma.PatientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PatientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          findMany: {
            args: Prisma.PatientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          create: {
            args: Prisma.PatientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          createMany: {
            args: Prisma.PatientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PatientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          delete: {
            args: Prisma.PatientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          update: {
            args: Prisma.PatientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          deleteMany: {
            args: Prisma.PatientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PatientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PatientUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>[]
          }
          upsert: {
            args: Prisma.PatientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientPayload>
          }
          aggregate: {
            args: Prisma.PatientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePatient>
          }
          groupBy: {
            args: Prisma.PatientGroupByArgs<ExtArgs>
            result: $Utils.Optional<PatientGroupByOutputType>[]
          }
          count: {
            args: Prisma.PatientCountArgs<ExtArgs>
            result: $Utils.Optional<PatientCountAggregateOutputType> | number
          }
        }
      }
      Episode: {
        payload: Prisma.$EpisodePayload<ExtArgs>
        fields: Prisma.EpisodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EpisodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EpisodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>
          }
          findFirst: {
            args: Prisma.EpisodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EpisodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>
          }
          findMany: {
            args: Prisma.EpisodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>[]
          }
          create: {
            args: Prisma.EpisodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>
          }
          createMany: {
            args: Prisma.EpisodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EpisodeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>[]
          }
          delete: {
            args: Prisma.EpisodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>
          }
          update: {
            args: Prisma.EpisodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>
          }
          deleteMany: {
            args: Prisma.EpisodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EpisodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EpisodeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>[]
          }
          upsert: {
            args: Prisma.EpisodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpisodePayload>
          }
          aggregate: {
            args: Prisma.EpisodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEpisode>
          }
          groupBy: {
            args: Prisma.EpisodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<EpisodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.EpisodeCountArgs<ExtArgs>
            result: $Utils.Optional<EpisodeCountAggregateOutputType> | number
          }
        }
      }
      Allergy: {
        payload: Prisma.$AllergyPayload<ExtArgs>
        fields: Prisma.AllergyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AllergyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AllergyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>
          }
          findFirst: {
            args: Prisma.AllergyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AllergyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>
          }
          findMany: {
            args: Prisma.AllergyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>[]
          }
          create: {
            args: Prisma.AllergyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>
          }
          createMany: {
            args: Prisma.AllergyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AllergyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>[]
          }
          delete: {
            args: Prisma.AllergyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>
          }
          update: {
            args: Prisma.AllergyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>
          }
          deleteMany: {
            args: Prisma.AllergyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AllergyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AllergyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>[]
          }
          upsert: {
            args: Prisma.AllergyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AllergyPayload>
          }
          aggregate: {
            args: Prisma.AllergyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAllergy>
          }
          groupBy: {
            args: Prisma.AllergyGroupByArgs<ExtArgs>
            result: $Utils.Optional<AllergyGroupByOutputType>[]
          }
          count: {
            args: Prisma.AllergyCountArgs<ExtArgs>
            result: $Utils.Optional<AllergyCountAggregateOutputType> | number
          }
        }
      }
      Note: {
        payload: Prisma.$NotePayload<ExtArgs>
        fields: Prisma.NoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          findFirst: {
            args: Prisma.NoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          findMany: {
            args: Prisma.NoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>[]
          }
          create: {
            args: Prisma.NoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          createMany: {
            args: Prisma.NoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NoteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>[]
          }
          delete: {
            args: Prisma.NoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          update: {
            args: Prisma.NoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          deleteMany: {
            args: Prisma.NoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NoteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>[]
          }
          upsert: {
            args: Prisma.NoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          aggregate: {
            args: Prisma.NoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNote>
          }
          groupBy: {
            args: Prisma.NoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<NoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.NoteCountArgs<ExtArgs>
            result: $Utils.Optional<NoteCountAggregateOutputType> | number
          }
        }
      }
      VitalSign: {
        payload: Prisma.$VitalSignPayload<ExtArgs>
        fields: Prisma.VitalSignFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VitalSignFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VitalSignFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>
          }
          findFirst: {
            args: Prisma.VitalSignFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VitalSignFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>
          }
          findMany: {
            args: Prisma.VitalSignFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>[]
          }
          create: {
            args: Prisma.VitalSignCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>
          }
          createMany: {
            args: Prisma.VitalSignCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VitalSignCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>[]
          }
          delete: {
            args: Prisma.VitalSignDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>
          }
          update: {
            args: Prisma.VitalSignUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>
          }
          deleteMany: {
            args: Prisma.VitalSignDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VitalSignUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VitalSignUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>[]
          }
          upsert: {
            args: Prisma.VitalSignUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VitalSignPayload>
          }
          aggregate: {
            args: Prisma.VitalSignAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVitalSign>
          }
          groupBy: {
            args: Prisma.VitalSignGroupByArgs<ExtArgs>
            result: $Utils.Optional<VitalSignGroupByOutputType>[]
          }
          count: {
            args: Prisma.VitalSignCountArgs<ExtArgs>
            result: $Utils.Optional<VitalSignCountAggregateOutputType> | number
          }
        }
      }
      Handoff: {
        payload: Prisma.$HandoffPayload<ExtArgs>
        fields: Prisma.HandoffFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HandoffFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HandoffFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>
          }
          findFirst: {
            args: Prisma.HandoffFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HandoffFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>
          }
          findMany: {
            args: Prisma.HandoffFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>[]
          }
          create: {
            args: Prisma.HandoffCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>
          }
          createMany: {
            args: Prisma.HandoffCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HandoffCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>[]
          }
          delete: {
            args: Prisma.HandoffDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>
          }
          update: {
            args: Prisma.HandoffUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>
          }
          deleteMany: {
            args: Prisma.HandoffDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HandoffUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.HandoffUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>[]
          }
          upsert: {
            args: Prisma.HandoffUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HandoffPayload>
          }
          aggregate: {
            args: Prisma.HandoffAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHandoff>
          }
          groupBy: {
            args: Prisma.HandoffGroupByArgs<ExtArgs>
            result: $Utils.Optional<HandoffGroupByOutputType>[]
          }
          count: {
            args: Prisma.HandoffCountArgs<ExtArgs>
            result: $Utils.Optional<HandoffCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    auditLog?: AuditLogOmit
    patient?: PatientOmit
    episode?: EpisodeOmit
    allergy?: AllergyOmit
    note?: NoteOmit
    vitalSign?: VitalSignOmit
    handoff?: HandoffOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    auditEntries: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    auditEntries?: boolean | UserCountOutputTypeCountAuditEntriesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuditEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * Count Type PatientCountOutputType
   */

  export type PatientCountOutputType = {
    episodes: number
    allergies: number
  }

  export type PatientCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episodes?: boolean | PatientCountOutputTypeCountEpisodesArgs
    allergies?: boolean | PatientCountOutputTypeCountAllergiesArgs
  }

  // Custom InputTypes
  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientCountOutputType
     */
    select?: PatientCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountEpisodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EpisodeWhereInput
  }

  /**
   * PatientCountOutputType without action
   */
  export type PatientCountOutputTypeCountAllergiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AllergyWhereInput
  }


  /**
   * Count Type EpisodeCountOutputType
   */

  export type EpisodeCountOutputType = {
    allergies: number
    notes: number
    vitals: number
    handoffs: number
  }

  export type EpisodeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    allergies?: boolean | EpisodeCountOutputTypeCountAllergiesArgs
    notes?: boolean | EpisodeCountOutputTypeCountNotesArgs
    vitals?: boolean | EpisodeCountOutputTypeCountVitalsArgs
    handoffs?: boolean | EpisodeCountOutputTypeCountHandoffsArgs
  }

  // Custom InputTypes
  /**
   * EpisodeCountOutputType without action
   */
  export type EpisodeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EpisodeCountOutputType
     */
    select?: EpisodeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EpisodeCountOutputType without action
   */
  export type EpisodeCountOutputTypeCountAllergiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AllergyWhereInput
  }

  /**
   * EpisodeCountOutputType without action
   */
  export type EpisodeCountOutputTypeCountNotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NoteWhereInput
  }

  /**
   * EpisodeCountOutputType without action
   */
  export type EpisodeCountOutputTypeCountVitalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VitalSignWhereInput
  }

  /**
   * EpisodeCountOutputType without action
   */
  export type EpisodeCountOutputTypeCountHandoffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HandoffWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    fullName: string | null
    role: $Enums.Role | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    fullName: string | null
    role: $Enums.Role | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    fullName: number
    role: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    fullName?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    fullName?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    fullName?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    fullName: string
    role: $Enums.Role
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    fullName?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    auditEntries?: boolean | User$auditEntriesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    fullName?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    fullName?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    fullName?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "fullName" | "role" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    auditEntries?: boolean | User$auditEntriesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      auditEntries: Prisma.$AuditLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      fullName: string
      role: $Enums.Role
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    auditEntries<T extends User$auditEntriesArgs<ExtArgs> = {}>(args?: Subset<T, User$auditEntriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly fullName: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.auditEntries
   */
  export type User$auditEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _avg: AuditLogAvgAggregateOutputType | null
    _sum: AuditLogSumAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogAvgAggregateOutputType = {
    id: number | null
    seq: number | null
  }

  export type AuditLogSumAggregateOutputType = {
    id: bigint | null
    seq: bigint | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: bigint | null
    seq: bigint | null
    prevHash: string | null
    entryHash: string | null
    actorId: string | null
    actorRole: string | null
    patientId: string | null
    episodeId: string | null
    action: string | null
    entity: string | null
    entityId: string | null
    reason: string | null
    ipAddress: string | null
    userAgent: string | null
    serverTs: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: bigint | null
    seq: bigint | null
    prevHash: string | null
    entryHash: string | null
    actorId: string | null
    actorRole: string | null
    patientId: string | null
    episodeId: string | null
    action: string | null
    entity: string | null
    entityId: string | null
    reason: string | null
    ipAddress: string | null
    userAgent: string | null
    serverTs: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    seq: number
    prevHash: number
    entryHash: number
    actorId: number
    actorRole: number
    patientId: number
    episodeId: number
    action: number
    entity: number
    entityId: number
    oldValue: number
    newValue: number
    reason: number
    ipAddress: number
    userAgent: number
    serverTs: number
    _all: number
  }


  export type AuditLogAvgAggregateInputType = {
    id?: true
    seq?: true
  }

  export type AuditLogSumAggregateInputType = {
    id?: true
    seq?: true
  }

  export type AuditLogMinAggregateInputType = {
    id?: true
    seq?: true
    prevHash?: true
    entryHash?: true
    actorId?: true
    actorRole?: true
    patientId?: true
    episodeId?: true
    action?: true
    entity?: true
    entityId?: true
    reason?: true
    ipAddress?: true
    userAgent?: true
    serverTs?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    seq?: true
    prevHash?: true
    entryHash?: true
    actorId?: true
    actorRole?: true
    patientId?: true
    episodeId?: true
    action?: true
    entity?: true
    entityId?: true
    reason?: true
    ipAddress?: true
    userAgent?: true
    serverTs?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    seq?: true
    prevHash?: true
    entryHash?: true
    actorId?: true
    actorRole?: true
    patientId?: true
    episodeId?: true
    action?: true
    entity?: true
    entityId?: true
    oldValue?: true
    newValue?: true
    reason?: true
    ipAddress?: true
    userAgent?: true
    serverTs?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuditLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuditLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _avg?: AuditLogAvgAggregateInputType
    _sum?: AuditLogSumAggregateInputType
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: bigint
    seq: bigint
    prevHash: string
    entryHash: string
    actorId: string
    actorRole: string
    patientId: string | null
    episodeId: string | null
    action: string
    entity: string
    entityId: string | null
    oldValue: JsonValue | null
    newValue: JsonValue | null
    reason: string | null
    ipAddress: string | null
    userAgent: string | null
    serverTs: Date
    _count: AuditLogCountAggregateOutputType | null
    _avg: AuditLogAvgAggregateOutputType | null
    _sum: AuditLogSumAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    seq?: boolean
    prevHash?: boolean
    entryHash?: boolean
    actorId?: boolean
    actorRole?: boolean
    patientId?: boolean
    episodeId?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    oldValue?: boolean
    newValue?: boolean
    reason?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    serverTs?: boolean
    actor?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    seq?: boolean
    prevHash?: boolean
    entryHash?: boolean
    actorId?: boolean
    actorRole?: boolean
    patientId?: boolean
    episodeId?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    oldValue?: boolean
    newValue?: boolean
    reason?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    serverTs?: boolean
    actor?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    seq?: boolean
    prevHash?: boolean
    entryHash?: boolean
    actorId?: boolean
    actorRole?: boolean
    patientId?: boolean
    episodeId?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    oldValue?: boolean
    newValue?: boolean
    reason?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    serverTs?: boolean
    actor?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    seq?: boolean
    prevHash?: boolean
    entryHash?: boolean
    actorId?: boolean
    actorRole?: boolean
    patientId?: boolean
    episodeId?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    oldValue?: boolean
    newValue?: boolean
    reason?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    serverTs?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "seq" | "prevHash" | "entryHash" | "actorId" | "actorRole" | "patientId" | "episodeId" | "action" | "entity" | "entityId" | "oldValue" | "newValue" | "reason" | "ipAddress" | "userAgent" | "serverTs", ExtArgs["result"]["auditLog"]>
  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    actor?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuditLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    actor?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuditLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    actor?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {
      actor: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      seq: bigint
      prevHash: string
      entryHash: string
      actorId: string
      actorRole: string
      patientId: string | null
      episodeId: string | null
      action: string
      entity: string
      entityId: string | null
      oldValue: Prisma.JsonValue | null
      newValue: Prisma.JsonValue | null
      reason: string | null
      ipAddress: string | null
      userAgent: string | null
      serverTs: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs and returns the data updated in the database.
     * @param {AuditLogUpdateManyAndReturnArgs} args - Arguments to update many AuditLogs.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuditLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    actor<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'BigInt'>
    readonly seq: FieldRef<"AuditLog", 'BigInt'>
    readonly prevHash: FieldRef<"AuditLog", 'String'>
    readonly entryHash: FieldRef<"AuditLog", 'String'>
    readonly actorId: FieldRef<"AuditLog", 'String'>
    readonly actorRole: FieldRef<"AuditLog", 'String'>
    readonly patientId: FieldRef<"AuditLog", 'String'>
    readonly episodeId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly entity: FieldRef<"AuditLog", 'String'>
    readonly entityId: FieldRef<"AuditLog", 'String'>
    readonly oldValue: FieldRef<"AuditLog", 'Json'>
    readonly newValue: FieldRef<"AuditLog", 'Json'>
    readonly reason: FieldRef<"AuditLog", 'String'>
    readonly ipAddress: FieldRef<"AuditLog", 'String'>
    readonly userAgent: FieldRef<"AuditLog", 'String'>
    readonly serverTs: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog updateManyAndReturn
   */
  export type AuditLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
  }


  /**
   * Model Patient
   */

  export type AggregatePatient = {
    _count: PatientCountAggregateOutputType | null
    _avg: PatientAvgAggregateOutputType | null
    _sum: PatientSumAggregateOutputType | null
    _min: PatientMinAggregateOutputType | null
    _max: PatientMaxAggregateOutputType | null
  }

  export type PatientAvgAggregateOutputType = {
    age: number | null
  }

  export type PatientSumAggregateOutputType = {
    age: number | null
  }

  export type PatientMinAggregateOutputType = {
    id: string | null
    expedienteNumber: string | null
    firstName: string | null
    lastName: string | null
    birthDate: Date | null
    age: number | null
    sex: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PatientMaxAggregateOutputType = {
    id: string | null
    expedienteNumber: string | null
    firstName: string | null
    lastName: string | null
    birthDate: Date | null
    age: number | null
    sex: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PatientCountAggregateOutputType = {
    id: number
    expedienteNumber: number
    firstName: number
    lastName: number
    birthDate: number
    age: number
    sex: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PatientAvgAggregateInputType = {
    age?: true
  }

  export type PatientSumAggregateInputType = {
    age?: true
  }

  export type PatientMinAggregateInputType = {
    id?: true
    expedienteNumber?: true
    firstName?: true
    lastName?: true
    birthDate?: true
    age?: true
    sex?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PatientMaxAggregateInputType = {
    id?: true
    expedienteNumber?: true
    firstName?: true
    lastName?: true
    birthDate?: true
    age?: true
    sex?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PatientCountAggregateInputType = {
    id?: true
    expedienteNumber?: true
    firstName?: true
    lastName?: true
    birthDate?: true
    age?: true
    sex?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PatientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Patient to aggregate.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Patients
    **/
    _count?: true | PatientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PatientAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PatientSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PatientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PatientMaxAggregateInputType
  }

  export type GetPatientAggregateType<T extends PatientAggregateArgs> = {
        [P in keyof T & keyof AggregatePatient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePatient[P]>
      : GetScalarType<T[P], AggregatePatient[P]>
  }




  export type PatientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PatientWhereInput
    orderBy?: PatientOrderByWithAggregationInput | PatientOrderByWithAggregationInput[]
    by: PatientScalarFieldEnum[] | PatientScalarFieldEnum
    having?: PatientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PatientCountAggregateInputType | true
    _avg?: PatientAvgAggregateInputType
    _sum?: PatientSumAggregateInputType
    _min?: PatientMinAggregateInputType
    _max?: PatientMaxAggregateInputType
  }

  export type PatientGroupByOutputType = {
    id: string
    expedienteNumber: string
    firstName: string
    lastName: string
    birthDate: Date | null
    age: number | null
    sex: string
    createdAt: Date
    updatedAt: Date
    _count: PatientCountAggregateOutputType | null
    _avg: PatientAvgAggregateOutputType | null
    _sum: PatientSumAggregateOutputType | null
    _min: PatientMinAggregateOutputType | null
    _max: PatientMaxAggregateOutputType | null
  }

  type GetPatientGroupByPayload<T extends PatientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PatientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PatientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PatientGroupByOutputType[P]>
            : GetScalarType<T[P], PatientGroupByOutputType[P]>
        }
      >
    >


  export type PatientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expedienteNumber?: boolean
    firstName?: boolean
    lastName?: boolean
    birthDate?: boolean
    age?: boolean
    sex?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    episodes?: boolean | Patient$episodesArgs<ExtArgs>
    allergies?: boolean | Patient$allergiesArgs<ExtArgs>
    _count?: boolean | PatientCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expedienteNumber?: boolean
    firstName?: boolean
    lastName?: boolean
    birthDate?: boolean
    age?: boolean
    sex?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expedienteNumber?: boolean
    firstName?: boolean
    lastName?: boolean
    birthDate?: boolean
    age?: boolean
    sex?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["patient"]>

  export type PatientSelectScalar = {
    id?: boolean
    expedienteNumber?: boolean
    firstName?: boolean
    lastName?: boolean
    birthDate?: boolean
    age?: boolean
    sex?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PatientOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "expedienteNumber" | "firstName" | "lastName" | "birthDate" | "age" | "sex" | "createdAt" | "updatedAt", ExtArgs["result"]["patient"]>
  export type PatientInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episodes?: boolean | Patient$episodesArgs<ExtArgs>
    allergies?: boolean | Patient$allergiesArgs<ExtArgs>
    _count?: boolean | PatientCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PatientIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PatientIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PatientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Patient"
    objects: {
      episodes: Prisma.$EpisodePayload<ExtArgs>[]
      allergies: Prisma.$AllergyPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      expedienteNumber: string
      firstName: string
      lastName: string
      birthDate: Date | null
      age: number | null
      sex: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["patient"]>
    composites: {}
  }

  type PatientGetPayload<S extends boolean | null | undefined | PatientDefaultArgs> = $Result.GetResult<Prisma.$PatientPayload, S>

  type PatientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PatientFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PatientCountAggregateInputType | true
    }

  export interface PatientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Patient'], meta: { name: 'Patient' } }
    /**
     * Find zero or one Patient that matches the filter.
     * @param {PatientFindUniqueArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PatientFindUniqueArgs>(args: SelectSubset<T, PatientFindUniqueArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Patient that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PatientFindUniqueOrThrowArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PatientFindUniqueOrThrowArgs>(args: SelectSubset<T, PatientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Patient that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindFirstArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PatientFindFirstArgs>(args?: SelectSubset<T, PatientFindFirstArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Patient that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindFirstOrThrowArgs} args - Arguments to find a Patient
     * @example
     * // Get one Patient
     * const patient = await prisma.patient.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PatientFindFirstOrThrowArgs>(args?: SelectSubset<T, PatientFindFirstOrThrowArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Patients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Patients
     * const patients = await prisma.patient.findMany()
     * 
     * // Get first 10 Patients
     * const patients = await prisma.patient.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const patientWithIdOnly = await prisma.patient.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PatientFindManyArgs>(args?: SelectSubset<T, PatientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Patient.
     * @param {PatientCreateArgs} args - Arguments to create a Patient.
     * @example
     * // Create one Patient
     * const Patient = await prisma.patient.create({
     *   data: {
     *     // ... data to create a Patient
     *   }
     * })
     * 
     */
    create<T extends PatientCreateArgs>(args: SelectSubset<T, PatientCreateArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Patients.
     * @param {PatientCreateManyArgs} args - Arguments to create many Patients.
     * @example
     * // Create many Patients
     * const patient = await prisma.patient.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PatientCreateManyArgs>(args?: SelectSubset<T, PatientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Patients and returns the data saved in the database.
     * @param {PatientCreateManyAndReturnArgs} args - Arguments to create many Patients.
     * @example
     * // Create many Patients
     * const patient = await prisma.patient.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Patients and only return the `id`
     * const patientWithIdOnly = await prisma.patient.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PatientCreateManyAndReturnArgs>(args?: SelectSubset<T, PatientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Patient.
     * @param {PatientDeleteArgs} args - Arguments to delete one Patient.
     * @example
     * // Delete one Patient
     * const Patient = await prisma.patient.delete({
     *   where: {
     *     // ... filter to delete one Patient
     *   }
     * })
     * 
     */
    delete<T extends PatientDeleteArgs>(args: SelectSubset<T, PatientDeleteArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Patient.
     * @param {PatientUpdateArgs} args - Arguments to update one Patient.
     * @example
     * // Update one Patient
     * const patient = await prisma.patient.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PatientUpdateArgs>(args: SelectSubset<T, PatientUpdateArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Patients.
     * @param {PatientDeleteManyArgs} args - Arguments to filter Patients to delete.
     * @example
     * // Delete a few Patients
     * const { count } = await prisma.patient.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PatientDeleteManyArgs>(args?: SelectSubset<T, PatientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Patients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Patients
     * const patient = await prisma.patient.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PatientUpdateManyArgs>(args: SelectSubset<T, PatientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Patients and returns the data updated in the database.
     * @param {PatientUpdateManyAndReturnArgs} args - Arguments to update many Patients.
     * @example
     * // Update many Patients
     * const patient = await prisma.patient.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Patients and only return the `id`
     * const patientWithIdOnly = await prisma.patient.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PatientUpdateManyAndReturnArgs>(args: SelectSubset<T, PatientUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Patient.
     * @param {PatientUpsertArgs} args - Arguments to update or create a Patient.
     * @example
     * // Update or create a Patient
     * const patient = await prisma.patient.upsert({
     *   create: {
     *     // ... data to create a Patient
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Patient we want to update
     *   }
     * })
     */
    upsert<T extends PatientUpsertArgs>(args: SelectSubset<T, PatientUpsertArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Patients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientCountArgs} args - Arguments to filter Patients to count.
     * @example
     * // Count the number of Patients
     * const count = await prisma.patient.count({
     *   where: {
     *     // ... the filter for the Patients we want to count
     *   }
     * })
    **/
    count<T extends PatientCountArgs>(
      args?: Subset<T, PatientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PatientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Patient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PatientAggregateArgs>(args: Subset<T, PatientAggregateArgs>): Prisma.PrismaPromise<GetPatientAggregateType<T>>

    /**
     * Group by Patient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PatientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PatientGroupByArgs['orderBy'] }
        : { orderBy?: PatientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PatientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPatientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Patient model
   */
  readonly fields: PatientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Patient.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PatientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    episodes<T extends Patient$episodesArgs<ExtArgs> = {}>(args?: Subset<T, Patient$episodesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    allergies<T extends Patient$allergiesArgs<ExtArgs> = {}>(args?: Subset<T, Patient$allergiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Patient model
   */
  interface PatientFieldRefs {
    readonly id: FieldRef<"Patient", 'String'>
    readonly expedienteNumber: FieldRef<"Patient", 'String'>
    readonly firstName: FieldRef<"Patient", 'String'>
    readonly lastName: FieldRef<"Patient", 'String'>
    readonly birthDate: FieldRef<"Patient", 'DateTime'>
    readonly age: FieldRef<"Patient", 'Int'>
    readonly sex: FieldRef<"Patient", 'String'>
    readonly createdAt: FieldRef<"Patient", 'DateTime'>
    readonly updatedAt: FieldRef<"Patient", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Patient findUnique
   */
  export type PatientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient findUniqueOrThrow
   */
  export type PatientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient findFirst
   */
  export type PatientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Patients.
     */
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient findFirstOrThrow
   */
  export type PatientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patient to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Patients.
     */
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient findMany
   */
  export type PatientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter, which Patients to fetch.
     */
    where?: PatientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Patients to fetch.
     */
    orderBy?: PatientOrderByWithRelationInput | PatientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Patients.
     */
    cursor?: PatientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Patients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Patients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Patients.
     */
    distinct?: PatientScalarFieldEnum | PatientScalarFieldEnum[]
  }

  /**
   * Patient create
   */
  export type PatientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The data needed to create a Patient.
     */
    data: XOR<PatientCreateInput, PatientUncheckedCreateInput>
  }

  /**
   * Patient createMany
   */
  export type PatientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Patients.
     */
    data: PatientCreateManyInput | PatientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Patient createManyAndReturn
   */
  export type PatientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * The data used to create many Patients.
     */
    data: PatientCreateManyInput | PatientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Patient update
   */
  export type PatientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The data needed to update a Patient.
     */
    data: XOR<PatientUpdateInput, PatientUncheckedUpdateInput>
    /**
     * Choose, which Patient to update.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient updateMany
   */
  export type PatientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Patients.
     */
    data: XOR<PatientUpdateManyMutationInput, PatientUncheckedUpdateManyInput>
    /**
     * Filter which Patients to update
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to update.
     */
    limit?: number
  }

  /**
   * Patient updateManyAndReturn
   */
  export type PatientUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * The data used to update Patients.
     */
    data: XOR<PatientUpdateManyMutationInput, PatientUncheckedUpdateManyInput>
    /**
     * Filter which Patients to update
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to update.
     */
    limit?: number
  }

  /**
   * Patient upsert
   */
  export type PatientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * The filter to search for the Patient to update in case it exists.
     */
    where: PatientWhereUniqueInput
    /**
     * In case the Patient found by the `where` argument doesn't exist, create a new Patient with this data.
     */
    create: XOR<PatientCreateInput, PatientUncheckedCreateInput>
    /**
     * In case the Patient was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PatientUpdateInput, PatientUncheckedUpdateInput>
  }

  /**
   * Patient delete
   */
  export type PatientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
    /**
     * Filter which Patient to delete.
     */
    where: PatientWhereUniqueInput
  }

  /**
   * Patient deleteMany
   */
  export type PatientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Patients to delete
     */
    where?: PatientWhereInput
    /**
     * Limit how many Patients to delete.
     */
    limit?: number
  }

  /**
   * Patient.episodes
   */
  export type Patient$episodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    where?: EpisodeWhereInput
    orderBy?: EpisodeOrderByWithRelationInput | EpisodeOrderByWithRelationInput[]
    cursor?: EpisodeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EpisodeScalarFieldEnum | EpisodeScalarFieldEnum[]
  }

  /**
   * Patient.allergies
   */
  export type Patient$allergiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    where?: AllergyWhereInput
    orderBy?: AllergyOrderByWithRelationInput | AllergyOrderByWithRelationInput[]
    cursor?: AllergyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AllergyScalarFieldEnum | AllergyScalarFieldEnum[]
  }

  /**
   * Patient without action
   */
  export type PatientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Patient
     */
    select?: PatientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Patient
     */
    omit?: PatientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PatientInclude<ExtArgs> | null
  }


  /**
   * Model Episode
   */

  export type AggregateEpisode = {
    _count: EpisodeCountAggregateOutputType | null
    _min: EpisodeMinAggregateOutputType | null
    _max: EpisodeMaxAggregateOutputType | null
  }

  export type EpisodeMinAggregateOutputType = {
    id: string | null
    patientId: string | null
    admissionDate: Date | null
    admissionType: string | null
    chiefComplaint: string | null
    status: string | null
    room: string | null
    bed: string | null
    attendingDoctor: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EpisodeMaxAggregateOutputType = {
    id: string | null
    patientId: string | null
    admissionDate: Date | null
    admissionType: string | null
    chiefComplaint: string | null
    status: string | null
    room: string | null
    bed: string | null
    attendingDoctor: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EpisodeCountAggregateOutputType = {
    id: number
    patientId: number
    admissionDate: number
    admissionType: number
    chiefComplaint: number
    status: number
    room: number
    bed: number
    attendingDoctor: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EpisodeMinAggregateInputType = {
    id?: true
    patientId?: true
    admissionDate?: true
    admissionType?: true
    chiefComplaint?: true
    status?: true
    room?: true
    bed?: true
    attendingDoctor?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EpisodeMaxAggregateInputType = {
    id?: true
    patientId?: true
    admissionDate?: true
    admissionType?: true
    chiefComplaint?: true
    status?: true
    room?: true
    bed?: true
    attendingDoctor?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EpisodeCountAggregateInputType = {
    id?: true
    patientId?: true
    admissionDate?: true
    admissionType?: true
    chiefComplaint?: true
    status?: true
    room?: true
    bed?: true
    attendingDoctor?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EpisodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Episode to aggregate.
     */
    where?: EpisodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Episodes to fetch.
     */
    orderBy?: EpisodeOrderByWithRelationInput | EpisodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EpisodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Episodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Episodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Episodes
    **/
    _count?: true | EpisodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EpisodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EpisodeMaxAggregateInputType
  }

  export type GetEpisodeAggregateType<T extends EpisodeAggregateArgs> = {
        [P in keyof T & keyof AggregateEpisode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEpisode[P]>
      : GetScalarType<T[P], AggregateEpisode[P]>
  }




  export type EpisodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EpisodeWhereInput
    orderBy?: EpisodeOrderByWithAggregationInput | EpisodeOrderByWithAggregationInput[]
    by: EpisodeScalarFieldEnum[] | EpisodeScalarFieldEnum
    having?: EpisodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EpisodeCountAggregateInputType | true
    _min?: EpisodeMinAggregateInputType
    _max?: EpisodeMaxAggregateInputType
  }

  export type EpisodeGroupByOutputType = {
    id: string
    patientId: string
    admissionDate: Date
    admissionType: string
    chiefComplaint: string | null
    status: string
    room: string | null
    bed: string | null
    attendingDoctor: string | null
    createdAt: Date
    updatedAt: Date
    _count: EpisodeCountAggregateOutputType | null
    _min: EpisodeMinAggregateOutputType | null
    _max: EpisodeMaxAggregateOutputType | null
  }

  type GetEpisodeGroupByPayload<T extends EpisodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EpisodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EpisodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EpisodeGroupByOutputType[P]>
            : GetScalarType<T[P], EpisodeGroupByOutputType[P]>
        }
      >
    >


  export type EpisodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    admissionDate?: boolean
    admissionType?: boolean
    chiefComplaint?: boolean
    status?: boolean
    room?: boolean
    bed?: boolean
    attendingDoctor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    allergies?: boolean | Episode$allergiesArgs<ExtArgs>
    notes?: boolean | Episode$notesArgs<ExtArgs>
    vitals?: boolean | Episode$vitalsArgs<ExtArgs>
    handoffs?: boolean | Episode$handoffsArgs<ExtArgs>
    _count?: boolean | EpisodeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["episode"]>

  export type EpisodeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    admissionDate?: boolean
    admissionType?: boolean
    chiefComplaint?: boolean
    status?: boolean
    room?: boolean
    bed?: boolean
    attendingDoctor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["episode"]>

  export type EpisodeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    admissionDate?: boolean
    admissionType?: boolean
    chiefComplaint?: boolean
    status?: boolean
    room?: boolean
    bed?: boolean
    attendingDoctor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["episode"]>

  export type EpisodeSelectScalar = {
    id?: boolean
    patientId?: boolean
    admissionDate?: boolean
    admissionType?: boolean
    chiefComplaint?: boolean
    status?: boolean
    room?: boolean
    bed?: boolean
    attendingDoctor?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EpisodeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "patientId" | "admissionDate" | "admissionType" | "chiefComplaint" | "status" | "room" | "bed" | "attendingDoctor" | "createdAt" | "updatedAt", ExtArgs["result"]["episode"]>
  export type EpisodeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    allergies?: boolean | Episode$allergiesArgs<ExtArgs>
    notes?: boolean | Episode$notesArgs<ExtArgs>
    vitals?: boolean | Episode$vitalsArgs<ExtArgs>
    handoffs?: boolean | Episode$handoffsArgs<ExtArgs>
    _count?: boolean | EpisodeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EpisodeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }
  export type EpisodeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
  }

  export type $EpisodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Episode"
    objects: {
      patient: Prisma.$PatientPayload<ExtArgs>
      allergies: Prisma.$AllergyPayload<ExtArgs>[]
      notes: Prisma.$NotePayload<ExtArgs>[]
      vitals: Prisma.$VitalSignPayload<ExtArgs>[]
      handoffs: Prisma.$HandoffPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      patientId: string
      admissionDate: Date
      admissionType: string
      chiefComplaint: string | null
      status: string
      room: string | null
      bed: string | null
      attendingDoctor: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["episode"]>
    composites: {}
  }

  type EpisodeGetPayload<S extends boolean | null | undefined | EpisodeDefaultArgs> = $Result.GetResult<Prisma.$EpisodePayload, S>

  type EpisodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EpisodeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EpisodeCountAggregateInputType | true
    }

  export interface EpisodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Episode'], meta: { name: 'Episode' } }
    /**
     * Find zero or one Episode that matches the filter.
     * @param {EpisodeFindUniqueArgs} args - Arguments to find a Episode
     * @example
     * // Get one Episode
     * const episode = await prisma.episode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EpisodeFindUniqueArgs>(args: SelectSubset<T, EpisodeFindUniqueArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Episode that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EpisodeFindUniqueOrThrowArgs} args - Arguments to find a Episode
     * @example
     * // Get one Episode
     * const episode = await prisma.episode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EpisodeFindUniqueOrThrowArgs>(args: SelectSubset<T, EpisodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Episode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpisodeFindFirstArgs} args - Arguments to find a Episode
     * @example
     * // Get one Episode
     * const episode = await prisma.episode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EpisodeFindFirstArgs>(args?: SelectSubset<T, EpisodeFindFirstArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Episode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpisodeFindFirstOrThrowArgs} args - Arguments to find a Episode
     * @example
     * // Get one Episode
     * const episode = await prisma.episode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EpisodeFindFirstOrThrowArgs>(args?: SelectSubset<T, EpisodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Episodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpisodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Episodes
     * const episodes = await prisma.episode.findMany()
     * 
     * // Get first 10 Episodes
     * const episodes = await prisma.episode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const episodeWithIdOnly = await prisma.episode.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EpisodeFindManyArgs>(args?: SelectSubset<T, EpisodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Episode.
     * @param {EpisodeCreateArgs} args - Arguments to create a Episode.
     * @example
     * // Create one Episode
     * const Episode = await prisma.episode.create({
     *   data: {
     *     // ... data to create a Episode
     *   }
     * })
     * 
     */
    create<T extends EpisodeCreateArgs>(args: SelectSubset<T, EpisodeCreateArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Episodes.
     * @param {EpisodeCreateManyArgs} args - Arguments to create many Episodes.
     * @example
     * // Create many Episodes
     * const episode = await prisma.episode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EpisodeCreateManyArgs>(args?: SelectSubset<T, EpisodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Episodes and returns the data saved in the database.
     * @param {EpisodeCreateManyAndReturnArgs} args - Arguments to create many Episodes.
     * @example
     * // Create many Episodes
     * const episode = await prisma.episode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Episodes and only return the `id`
     * const episodeWithIdOnly = await prisma.episode.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EpisodeCreateManyAndReturnArgs>(args?: SelectSubset<T, EpisodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Episode.
     * @param {EpisodeDeleteArgs} args - Arguments to delete one Episode.
     * @example
     * // Delete one Episode
     * const Episode = await prisma.episode.delete({
     *   where: {
     *     // ... filter to delete one Episode
     *   }
     * })
     * 
     */
    delete<T extends EpisodeDeleteArgs>(args: SelectSubset<T, EpisodeDeleteArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Episode.
     * @param {EpisodeUpdateArgs} args - Arguments to update one Episode.
     * @example
     * // Update one Episode
     * const episode = await prisma.episode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EpisodeUpdateArgs>(args: SelectSubset<T, EpisodeUpdateArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Episodes.
     * @param {EpisodeDeleteManyArgs} args - Arguments to filter Episodes to delete.
     * @example
     * // Delete a few Episodes
     * const { count } = await prisma.episode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EpisodeDeleteManyArgs>(args?: SelectSubset<T, EpisodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Episodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpisodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Episodes
     * const episode = await prisma.episode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EpisodeUpdateManyArgs>(args: SelectSubset<T, EpisodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Episodes and returns the data updated in the database.
     * @param {EpisodeUpdateManyAndReturnArgs} args - Arguments to update many Episodes.
     * @example
     * // Update many Episodes
     * const episode = await prisma.episode.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Episodes and only return the `id`
     * const episodeWithIdOnly = await prisma.episode.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EpisodeUpdateManyAndReturnArgs>(args: SelectSubset<T, EpisodeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Episode.
     * @param {EpisodeUpsertArgs} args - Arguments to update or create a Episode.
     * @example
     * // Update or create a Episode
     * const episode = await prisma.episode.upsert({
     *   create: {
     *     // ... data to create a Episode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Episode we want to update
     *   }
     * })
     */
    upsert<T extends EpisodeUpsertArgs>(args: SelectSubset<T, EpisodeUpsertArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Episodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpisodeCountArgs} args - Arguments to filter Episodes to count.
     * @example
     * // Count the number of Episodes
     * const count = await prisma.episode.count({
     *   where: {
     *     // ... the filter for the Episodes we want to count
     *   }
     * })
    **/
    count<T extends EpisodeCountArgs>(
      args?: Subset<T, EpisodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EpisodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Episode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpisodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EpisodeAggregateArgs>(args: Subset<T, EpisodeAggregateArgs>): Prisma.PrismaPromise<GetEpisodeAggregateType<T>>

    /**
     * Group by Episode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpisodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EpisodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EpisodeGroupByArgs['orderBy'] }
        : { orderBy?: EpisodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EpisodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEpisodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Episode model
   */
  readonly fields: EpisodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Episode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EpisodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    patient<T extends PatientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PatientDefaultArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    allergies<T extends Episode$allergiesArgs<ExtArgs> = {}>(args?: Subset<T, Episode$allergiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notes<T extends Episode$notesArgs<ExtArgs> = {}>(args?: Subset<T, Episode$notesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    vitals<T extends Episode$vitalsArgs<ExtArgs> = {}>(args?: Subset<T, Episode$vitalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    handoffs<T extends Episode$handoffsArgs<ExtArgs> = {}>(args?: Subset<T, Episode$handoffsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Episode model
   */
  interface EpisodeFieldRefs {
    readonly id: FieldRef<"Episode", 'String'>
    readonly patientId: FieldRef<"Episode", 'String'>
    readonly admissionDate: FieldRef<"Episode", 'DateTime'>
    readonly admissionType: FieldRef<"Episode", 'String'>
    readonly chiefComplaint: FieldRef<"Episode", 'String'>
    readonly status: FieldRef<"Episode", 'String'>
    readonly room: FieldRef<"Episode", 'String'>
    readonly bed: FieldRef<"Episode", 'String'>
    readonly attendingDoctor: FieldRef<"Episode", 'String'>
    readonly createdAt: FieldRef<"Episode", 'DateTime'>
    readonly updatedAt: FieldRef<"Episode", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Episode findUnique
   */
  export type EpisodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * Filter, which Episode to fetch.
     */
    where: EpisodeWhereUniqueInput
  }

  /**
   * Episode findUniqueOrThrow
   */
  export type EpisodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * Filter, which Episode to fetch.
     */
    where: EpisodeWhereUniqueInput
  }

  /**
   * Episode findFirst
   */
  export type EpisodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * Filter, which Episode to fetch.
     */
    where?: EpisodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Episodes to fetch.
     */
    orderBy?: EpisodeOrderByWithRelationInput | EpisodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Episodes.
     */
    cursor?: EpisodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Episodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Episodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Episodes.
     */
    distinct?: EpisodeScalarFieldEnum | EpisodeScalarFieldEnum[]
  }

  /**
   * Episode findFirstOrThrow
   */
  export type EpisodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * Filter, which Episode to fetch.
     */
    where?: EpisodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Episodes to fetch.
     */
    orderBy?: EpisodeOrderByWithRelationInput | EpisodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Episodes.
     */
    cursor?: EpisodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Episodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Episodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Episodes.
     */
    distinct?: EpisodeScalarFieldEnum | EpisodeScalarFieldEnum[]
  }

  /**
   * Episode findMany
   */
  export type EpisodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * Filter, which Episodes to fetch.
     */
    where?: EpisodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Episodes to fetch.
     */
    orderBy?: EpisodeOrderByWithRelationInput | EpisodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Episodes.
     */
    cursor?: EpisodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Episodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Episodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Episodes.
     */
    distinct?: EpisodeScalarFieldEnum | EpisodeScalarFieldEnum[]
  }

  /**
   * Episode create
   */
  export type EpisodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * The data needed to create a Episode.
     */
    data: XOR<EpisodeCreateInput, EpisodeUncheckedCreateInput>
  }

  /**
   * Episode createMany
   */
  export type EpisodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Episodes.
     */
    data: EpisodeCreateManyInput | EpisodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Episode createManyAndReturn
   */
  export type EpisodeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * The data used to create many Episodes.
     */
    data: EpisodeCreateManyInput | EpisodeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Episode update
   */
  export type EpisodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * The data needed to update a Episode.
     */
    data: XOR<EpisodeUpdateInput, EpisodeUncheckedUpdateInput>
    /**
     * Choose, which Episode to update.
     */
    where: EpisodeWhereUniqueInput
  }

  /**
   * Episode updateMany
   */
  export type EpisodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Episodes.
     */
    data: XOR<EpisodeUpdateManyMutationInput, EpisodeUncheckedUpdateManyInput>
    /**
     * Filter which Episodes to update
     */
    where?: EpisodeWhereInput
    /**
     * Limit how many Episodes to update.
     */
    limit?: number
  }

  /**
   * Episode updateManyAndReturn
   */
  export type EpisodeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * The data used to update Episodes.
     */
    data: XOR<EpisodeUpdateManyMutationInput, EpisodeUncheckedUpdateManyInput>
    /**
     * Filter which Episodes to update
     */
    where?: EpisodeWhereInput
    /**
     * Limit how many Episodes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Episode upsert
   */
  export type EpisodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * The filter to search for the Episode to update in case it exists.
     */
    where: EpisodeWhereUniqueInput
    /**
     * In case the Episode found by the `where` argument doesn't exist, create a new Episode with this data.
     */
    create: XOR<EpisodeCreateInput, EpisodeUncheckedCreateInput>
    /**
     * In case the Episode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EpisodeUpdateInput, EpisodeUncheckedUpdateInput>
  }

  /**
   * Episode delete
   */
  export type EpisodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
    /**
     * Filter which Episode to delete.
     */
    where: EpisodeWhereUniqueInput
  }

  /**
   * Episode deleteMany
   */
  export type EpisodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Episodes to delete
     */
    where?: EpisodeWhereInput
    /**
     * Limit how many Episodes to delete.
     */
    limit?: number
  }

  /**
   * Episode.allergies
   */
  export type Episode$allergiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    where?: AllergyWhereInput
    orderBy?: AllergyOrderByWithRelationInput | AllergyOrderByWithRelationInput[]
    cursor?: AllergyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AllergyScalarFieldEnum | AllergyScalarFieldEnum[]
  }

  /**
   * Episode.notes
   */
  export type Episode$notesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    where?: NoteWhereInput
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    cursor?: NoteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NoteScalarFieldEnum | NoteScalarFieldEnum[]
  }

  /**
   * Episode.vitals
   */
  export type Episode$vitalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    where?: VitalSignWhereInput
    orderBy?: VitalSignOrderByWithRelationInput | VitalSignOrderByWithRelationInput[]
    cursor?: VitalSignWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VitalSignScalarFieldEnum | VitalSignScalarFieldEnum[]
  }

  /**
   * Episode.handoffs
   */
  export type Episode$handoffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    where?: HandoffWhereInput
    orderBy?: HandoffOrderByWithRelationInput | HandoffOrderByWithRelationInput[]
    cursor?: HandoffWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HandoffScalarFieldEnum | HandoffScalarFieldEnum[]
  }

  /**
   * Episode without action
   */
  export type EpisodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Episode
     */
    select?: EpisodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Episode
     */
    omit?: EpisodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpisodeInclude<ExtArgs> | null
  }


  /**
   * Model Allergy
   */

  export type AggregateAllergy = {
    _count: AllergyCountAggregateOutputType | null
    _min: AllergyMinAggregateOutputType | null
    _max: AllergyMaxAggregateOutputType | null
  }

  export type AllergyMinAggregateOutputType = {
    id: string | null
    patientId: string | null
    episodeId: string | null
    allergen: string | null
    type: string | null
    reaction: string | null
    severity: string | null
    status: string | null
    createdAt: Date | null
    createdBy: string | null
  }

  export type AllergyMaxAggregateOutputType = {
    id: string | null
    patientId: string | null
    episodeId: string | null
    allergen: string | null
    type: string | null
    reaction: string | null
    severity: string | null
    status: string | null
    createdAt: Date | null
    createdBy: string | null
  }

  export type AllergyCountAggregateOutputType = {
    id: number
    patientId: number
    episodeId: number
    allergen: number
    type: number
    reaction: number
    severity: number
    status: number
    createdAt: number
    createdBy: number
    _all: number
  }


  export type AllergyMinAggregateInputType = {
    id?: true
    patientId?: true
    episodeId?: true
    allergen?: true
    type?: true
    reaction?: true
    severity?: true
    status?: true
    createdAt?: true
    createdBy?: true
  }

  export type AllergyMaxAggregateInputType = {
    id?: true
    patientId?: true
    episodeId?: true
    allergen?: true
    type?: true
    reaction?: true
    severity?: true
    status?: true
    createdAt?: true
    createdBy?: true
  }

  export type AllergyCountAggregateInputType = {
    id?: true
    patientId?: true
    episodeId?: true
    allergen?: true
    type?: true
    reaction?: true
    severity?: true
    status?: true
    createdAt?: true
    createdBy?: true
    _all?: true
  }

  export type AllergyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Allergy to aggregate.
     */
    where?: AllergyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Allergies to fetch.
     */
    orderBy?: AllergyOrderByWithRelationInput | AllergyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AllergyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Allergies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Allergies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Allergies
    **/
    _count?: true | AllergyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AllergyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AllergyMaxAggregateInputType
  }

  export type GetAllergyAggregateType<T extends AllergyAggregateArgs> = {
        [P in keyof T & keyof AggregateAllergy]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAllergy[P]>
      : GetScalarType<T[P], AggregateAllergy[P]>
  }




  export type AllergyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AllergyWhereInput
    orderBy?: AllergyOrderByWithAggregationInput | AllergyOrderByWithAggregationInput[]
    by: AllergyScalarFieldEnum[] | AllergyScalarFieldEnum
    having?: AllergyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AllergyCountAggregateInputType | true
    _min?: AllergyMinAggregateInputType
    _max?: AllergyMaxAggregateInputType
  }

  export type AllergyGroupByOutputType = {
    id: string
    patientId: string
    episodeId: string
    allergen: string
    type: string
    reaction: string | null
    severity: string
    status: string
    createdAt: Date
    createdBy: string
    _count: AllergyCountAggregateOutputType | null
    _min: AllergyMinAggregateOutputType | null
    _max: AllergyMaxAggregateOutputType | null
  }

  type GetAllergyGroupByPayload<T extends AllergyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AllergyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AllergyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AllergyGroupByOutputType[P]>
            : GetScalarType<T[P], AllergyGroupByOutputType[P]>
        }
      >
    >


  export type AllergySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    episodeId?: boolean
    allergen?: boolean
    type?: boolean
    reaction?: boolean
    severity?: boolean
    status?: boolean
    createdAt?: boolean
    createdBy?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["allergy"]>

  export type AllergySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    episodeId?: boolean
    allergen?: boolean
    type?: boolean
    reaction?: boolean
    severity?: boolean
    status?: boolean
    createdAt?: boolean
    createdBy?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["allergy"]>

  export type AllergySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    patientId?: boolean
    episodeId?: boolean
    allergen?: boolean
    type?: boolean
    reaction?: boolean
    severity?: boolean
    status?: boolean
    createdAt?: boolean
    createdBy?: boolean
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["allergy"]>

  export type AllergySelectScalar = {
    id?: boolean
    patientId?: boolean
    episodeId?: boolean
    allergen?: boolean
    type?: boolean
    reaction?: boolean
    severity?: boolean
    status?: boolean
    createdAt?: boolean
    createdBy?: boolean
  }

  export type AllergyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "patientId" | "episodeId" | "allergen" | "type" | "reaction" | "severity" | "status" | "createdAt" | "createdBy", ExtArgs["result"]["allergy"]>
  export type AllergyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }
  export type AllergyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }
  export type AllergyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    patient?: boolean | PatientDefaultArgs<ExtArgs>
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }

  export type $AllergyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Allergy"
    objects: {
      patient: Prisma.$PatientPayload<ExtArgs>
      episode: Prisma.$EpisodePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      patientId: string
      episodeId: string
      allergen: string
      type: string
      reaction: string | null
      severity: string
      status: string
      createdAt: Date
      createdBy: string
    }, ExtArgs["result"]["allergy"]>
    composites: {}
  }

  type AllergyGetPayload<S extends boolean | null | undefined | AllergyDefaultArgs> = $Result.GetResult<Prisma.$AllergyPayload, S>

  type AllergyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AllergyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AllergyCountAggregateInputType | true
    }

  export interface AllergyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Allergy'], meta: { name: 'Allergy' } }
    /**
     * Find zero or one Allergy that matches the filter.
     * @param {AllergyFindUniqueArgs} args - Arguments to find a Allergy
     * @example
     * // Get one Allergy
     * const allergy = await prisma.allergy.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AllergyFindUniqueArgs>(args: SelectSubset<T, AllergyFindUniqueArgs<ExtArgs>>): Prisma__AllergyClient<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Allergy that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AllergyFindUniqueOrThrowArgs} args - Arguments to find a Allergy
     * @example
     * // Get one Allergy
     * const allergy = await prisma.allergy.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AllergyFindUniqueOrThrowArgs>(args: SelectSubset<T, AllergyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AllergyClient<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Allergy that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AllergyFindFirstArgs} args - Arguments to find a Allergy
     * @example
     * // Get one Allergy
     * const allergy = await prisma.allergy.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AllergyFindFirstArgs>(args?: SelectSubset<T, AllergyFindFirstArgs<ExtArgs>>): Prisma__AllergyClient<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Allergy that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AllergyFindFirstOrThrowArgs} args - Arguments to find a Allergy
     * @example
     * // Get one Allergy
     * const allergy = await prisma.allergy.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AllergyFindFirstOrThrowArgs>(args?: SelectSubset<T, AllergyFindFirstOrThrowArgs<ExtArgs>>): Prisma__AllergyClient<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Allergies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AllergyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Allergies
     * const allergies = await prisma.allergy.findMany()
     * 
     * // Get first 10 Allergies
     * const allergies = await prisma.allergy.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const allergyWithIdOnly = await prisma.allergy.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AllergyFindManyArgs>(args?: SelectSubset<T, AllergyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Allergy.
     * @param {AllergyCreateArgs} args - Arguments to create a Allergy.
     * @example
     * // Create one Allergy
     * const Allergy = await prisma.allergy.create({
     *   data: {
     *     // ... data to create a Allergy
     *   }
     * })
     * 
     */
    create<T extends AllergyCreateArgs>(args: SelectSubset<T, AllergyCreateArgs<ExtArgs>>): Prisma__AllergyClient<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Allergies.
     * @param {AllergyCreateManyArgs} args - Arguments to create many Allergies.
     * @example
     * // Create many Allergies
     * const allergy = await prisma.allergy.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AllergyCreateManyArgs>(args?: SelectSubset<T, AllergyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Allergies and returns the data saved in the database.
     * @param {AllergyCreateManyAndReturnArgs} args - Arguments to create many Allergies.
     * @example
     * // Create many Allergies
     * const allergy = await prisma.allergy.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Allergies and only return the `id`
     * const allergyWithIdOnly = await prisma.allergy.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AllergyCreateManyAndReturnArgs>(args?: SelectSubset<T, AllergyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Allergy.
     * @param {AllergyDeleteArgs} args - Arguments to delete one Allergy.
     * @example
     * // Delete one Allergy
     * const Allergy = await prisma.allergy.delete({
     *   where: {
     *     // ... filter to delete one Allergy
     *   }
     * })
     * 
     */
    delete<T extends AllergyDeleteArgs>(args: SelectSubset<T, AllergyDeleteArgs<ExtArgs>>): Prisma__AllergyClient<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Allergy.
     * @param {AllergyUpdateArgs} args - Arguments to update one Allergy.
     * @example
     * // Update one Allergy
     * const allergy = await prisma.allergy.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AllergyUpdateArgs>(args: SelectSubset<T, AllergyUpdateArgs<ExtArgs>>): Prisma__AllergyClient<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Allergies.
     * @param {AllergyDeleteManyArgs} args - Arguments to filter Allergies to delete.
     * @example
     * // Delete a few Allergies
     * const { count } = await prisma.allergy.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AllergyDeleteManyArgs>(args?: SelectSubset<T, AllergyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Allergies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AllergyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Allergies
     * const allergy = await prisma.allergy.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AllergyUpdateManyArgs>(args: SelectSubset<T, AllergyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Allergies and returns the data updated in the database.
     * @param {AllergyUpdateManyAndReturnArgs} args - Arguments to update many Allergies.
     * @example
     * // Update many Allergies
     * const allergy = await prisma.allergy.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Allergies and only return the `id`
     * const allergyWithIdOnly = await prisma.allergy.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AllergyUpdateManyAndReturnArgs>(args: SelectSubset<T, AllergyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Allergy.
     * @param {AllergyUpsertArgs} args - Arguments to update or create a Allergy.
     * @example
     * // Update or create a Allergy
     * const allergy = await prisma.allergy.upsert({
     *   create: {
     *     // ... data to create a Allergy
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Allergy we want to update
     *   }
     * })
     */
    upsert<T extends AllergyUpsertArgs>(args: SelectSubset<T, AllergyUpsertArgs<ExtArgs>>): Prisma__AllergyClient<$Result.GetResult<Prisma.$AllergyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Allergies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AllergyCountArgs} args - Arguments to filter Allergies to count.
     * @example
     * // Count the number of Allergies
     * const count = await prisma.allergy.count({
     *   where: {
     *     // ... the filter for the Allergies we want to count
     *   }
     * })
    **/
    count<T extends AllergyCountArgs>(
      args?: Subset<T, AllergyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AllergyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Allergy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AllergyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AllergyAggregateArgs>(args: Subset<T, AllergyAggregateArgs>): Prisma.PrismaPromise<GetAllergyAggregateType<T>>

    /**
     * Group by Allergy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AllergyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AllergyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AllergyGroupByArgs['orderBy'] }
        : { orderBy?: AllergyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AllergyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAllergyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Allergy model
   */
  readonly fields: AllergyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Allergy.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AllergyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    patient<T extends PatientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PatientDefaultArgs<ExtArgs>>): Prisma__PatientClient<$Result.GetResult<Prisma.$PatientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    episode<T extends EpisodeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EpisodeDefaultArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Allergy model
   */
  interface AllergyFieldRefs {
    readonly id: FieldRef<"Allergy", 'String'>
    readonly patientId: FieldRef<"Allergy", 'String'>
    readonly episodeId: FieldRef<"Allergy", 'String'>
    readonly allergen: FieldRef<"Allergy", 'String'>
    readonly type: FieldRef<"Allergy", 'String'>
    readonly reaction: FieldRef<"Allergy", 'String'>
    readonly severity: FieldRef<"Allergy", 'String'>
    readonly status: FieldRef<"Allergy", 'String'>
    readonly createdAt: FieldRef<"Allergy", 'DateTime'>
    readonly createdBy: FieldRef<"Allergy", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Allergy findUnique
   */
  export type AllergyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * Filter, which Allergy to fetch.
     */
    where: AllergyWhereUniqueInput
  }

  /**
   * Allergy findUniqueOrThrow
   */
  export type AllergyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * Filter, which Allergy to fetch.
     */
    where: AllergyWhereUniqueInput
  }

  /**
   * Allergy findFirst
   */
  export type AllergyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * Filter, which Allergy to fetch.
     */
    where?: AllergyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Allergies to fetch.
     */
    orderBy?: AllergyOrderByWithRelationInput | AllergyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Allergies.
     */
    cursor?: AllergyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Allergies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Allergies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Allergies.
     */
    distinct?: AllergyScalarFieldEnum | AllergyScalarFieldEnum[]
  }

  /**
   * Allergy findFirstOrThrow
   */
  export type AllergyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * Filter, which Allergy to fetch.
     */
    where?: AllergyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Allergies to fetch.
     */
    orderBy?: AllergyOrderByWithRelationInput | AllergyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Allergies.
     */
    cursor?: AllergyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Allergies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Allergies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Allergies.
     */
    distinct?: AllergyScalarFieldEnum | AllergyScalarFieldEnum[]
  }

  /**
   * Allergy findMany
   */
  export type AllergyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * Filter, which Allergies to fetch.
     */
    where?: AllergyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Allergies to fetch.
     */
    orderBy?: AllergyOrderByWithRelationInput | AllergyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Allergies.
     */
    cursor?: AllergyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Allergies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Allergies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Allergies.
     */
    distinct?: AllergyScalarFieldEnum | AllergyScalarFieldEnum[]
  }

  /**
   * Allergy create
   */
  export type AllergyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * The data needed to create a Allergy.
     */
    data: XOR<AllergyCreateInput, AllergyUncheckedCreateInput>
  }

  /**
   * Allergy createMany
   */
  export type AllergyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Allergies.
     */
    data: AllergyCreateManyInput | AllergyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Allergy createManyAndReturn
   */
  export type AllergyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * The data used to create many Allergies.
     */
    data: AllergyCreateManyInput | AllergyCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Allergy update
   */
  export type AllergyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * The data needed to update a Allergy.
     */
    data: XOR<AllergyUpdateInput, AllergyUncheckedUpdateInput>
    /**
     * Choose, which Allergy to update.
     */
    where: AllergyWhereUniqueInput
  }

  /**
   * Allergy updateMany
   */
  export type AllergyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Allergies.
     */
    data: XOR<AllergyUpdateManyMutationInput, AllergyUncheckedUpdateManyInput>
    /**
     * Filter which Allergies to update
     */
    where?: AllergyWhereInput
    /**
     * Limit how many Allergies to update.
     */
    limit?: number
  }

  /**
   * Allergy updateManyAndReturn
   */
  export type AllergyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * The data used to update Allergies.
     */
    data: XOR<AllergyUpdateManyMutationInput, AllergyUncheckedUpdateManyInput>
    /**
     * Filter which Allergies to update
     */
    where?: AllergyWhereInput
    /**
     * Limit how many Allergies to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Allergy upsert
   */
  export type AllergyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * The filter to search for the Allergy to update in case it exists.
     */
    where: AllergyWhereUniqueInput
    /**
     * In case the Allergy found by the `where` argument doesn't exist, create a new Allergy with this data.
     */
    create: XOR<AllergyCreateInput, AllergyUncheckedCreateInput>
    /**
     * In case the Allergy was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AllergyUpdateInput, AllergyUncheckedUpdateInput>
  }

  /**
   * Allergy delete
   */
  export type AllergyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
    /**
     * Filter which Allergy to delete.
     */
    where: AllergyWhereUniqueInput
  }

  /**
   * Allergy deleteMany
   */
  export type AllergyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Allergies to delete
     */
    where?: AllergyWhereInput
    /**
     * Limit how many Allergies to delete.
     */
    limit?: number
  }

  /**
   * Allergy without action
   */
  export type AllergyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Allergy
     */
    select?: AllergySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Allergy
     */
    omit?: AllergyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AllergyInclude<ExtArgs> | null
  }


  /**
   * Model Note
   */

  export type AggregateNote = {
    _count: NoteCountAggregateOutputType | null
    _min: NoteMinAggregateOutputType | null
    _max: NoteMaxAggregateOutputType | null
  }

  export type NoteMinAggregateOutputType = {
    id: string | null
    episodeId: string | null
    subjective: string | null
    objective: string | null
    assessment: string | null
    plan: string | null
    status: string | null
    createdBy: string | null
    createdAt: Date | null
  }

  export type NoteMaxAggregateOutputType = {
    id: string | null
    episodeId: string | null
    subjective: string | null
    objective: string | null
    assessment: string | null
    plan: string | null
    status: string | null
    createdBy: string | null
    createdAt: Date | null
  }

  export type NoteCountAggregateOutputType = {
    id: number
    episodeId: number
    subjective: number
    objective: number
    assessment: number
    plan: number
    status: number
    createdBy: number
    createdAt: number
    _all: number
  }


  export type NoteMinAggregateInputType = {
    id?: true
    episodeId?: true
    subjective?: true
    objective?: true
    assessment?: true
    plan?: true
    status?: true
    createdBy?: true
    createdAt?: true
  }

  export type NoteMaxAggregateInputType = {
    id?: true
    episodeId?: true
    subjective?: true
    objective?: true
    assessment?: true
    plan?: true
    status?: true
    createdBy?: true
    createdAt?: true
  }

  export type NoteCountAggregateInputType = {
    id?: true
    episodeId?: true
    subjective?: true
    objective?: true
    assessment?: true
    plan?: true
    status?: true
    createdBy?: true
    createdAt?: true
    _all?: true
  }

  export type NoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Note to aggregate.
     */
    where?: NoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notes to fetch.
     */
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notes
    **/
    _count?: true | NoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NoteMaxAggregateInputType
  }

  export type GetNoteAggregateType<T extends NoteAggregateArgs> = {
        [P in keyof T & keyof AggregateNote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNote[P]>
      : GetScalarType<T[P], AggregateNote[P]>
  }




  export type NoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NoteWhereInput
    orderBy?: NoteOrderByWithAggregationInput | NoteOrderByWithAggregationInput[]
    by: NoteScalarFieldEnum[] | NoteScalarFieldEnum
    having?: NoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NoteCountAggregateInputType | true
    _min?: NoteMinAggregateInputType
    _max?: NoteMaxAggregateInputType
  }

  export type NoteGroupByOutputType = {
    id: string
    episodeId: string
    subjective: string | null
    objective: string | null
    assessment: string | null
    plan: string | null
    status: string
    createdBy: string
    createdAt: Date
    _count: NoteCountAggregateOutputType | null
    _min: NoteMinAggregateOutputType | null
    _max: NoteMaxAggregateOutputType | null
  }

  type GetNoteGroupByPayload<T extends NoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NoteGroupByOutputType[P]>
            : GetScalarType<T[P], NoteGroupByOutputType[P]>
        }
      >
    >


  export type NoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    subjective?: boolean
    objective?: boolean
    assessment?: boolean
    plan?: boolean
    status?: boolean
    createdBy?: boolean
    createdAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["note"]>

  export type NoteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    subjective?: boolean
    objective?: boolean
    assessment?: boolean
    plan?: boolean
    status?: boolean
    createdBy?: boolean
    createdAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["note"]>

  export type NoteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    subjective?: boolean
    objective?: boolean
    assessment?: boolean
    plan?: boolean
    status?: boolean
    createdBy?: boolean
    createdAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["note"]>

  export type NoteSelectScalar = {
    id?: boolean
    episodeId?: boolean
    subjective?: boolean
    objective?: boolean
    assessment?: boolean
    plan?: boolean
    status?: boolean
    createdBy?: boolean
    createdAt?: boolean
  }

  export type NoteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "episodeId" | "subjective" | "objective" | "assessment" | "plan" | "status" | "createdBy" | "createdAt", ExtArgs["result"]["note"]>
  export type NoteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }
  export type NoteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }
  export type NoteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }

  export type $NotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Note"
    objects: {
      episode: Prisma.$EpisodePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      episodeId: string
      subjective: string | null
      objective: string | null
      assessment: string | null
      plan: string | null
      status: string
      createdBy: string
      createdAt: Date
    }, ExtArgs["result"]["note"]>
    composites: {}
  }

  type NoteGetPayload<S extends boolean | null | undefined | NoteDefaultArgs> = $Result.GetResult<Prisma.$NotePayload, S>

  type NoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NoteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NoteCountAggregateInputType | true
    }

  export interface NoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Note'], meta: { name: 'Note' } }
    /**
     * Find zero or one Note that matches the filter.
     * @param {NoteFindUniqueArgs} args - Arguments to find a Note
     * @example
     * // Get one Note
     * const note = await prisma.note.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NoteFindUniqueArgs>(args: SelectSubset<T, NoteFindUniqueArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Note that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NoteFindUniqueOrThrowArgs} args - Arguments to find a Note
     * @example
     * // Get one Note
     * const note = await prisma.note.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NoteFindUniqueOrThrowArgs>(args: SelectSubset<T, NoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Note that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteFindFirstArgs} args - Arguments to find a Note
     * @example
     * // Get one Note
     * const note = await prisma.note.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NoteFindFirstArgs>(args?: SelectSubset<T, NoteFindFirstArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Note that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteFindFirstOrThrowArgs} args - Arguments to find a Note
     * @example
     * // Get one Note
     * const note = await prisma.note.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NoteFindFirstOrThrowArgs>(args?: SelectSubset<T, NoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notes
     * const notes = await prisma.note.findMany()
     * 
     * // Get first 10 Notes
     * const notes = await prisma.note.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const noteWithIdOnly = await prisma.note.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NoteFindManyArgs>(args?: SelectSubset<T, NoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Note.
     * @param {NoteCreateArgs} args - Arguments to create a Note.
     * @example
     * // Create one Note
     * const Note = await prisma.note.create({
     *   data: {
     *     // ... data to create a Note
     *   }
     * })
     * 
     */
    create<T extends NoteCreateArgs>(args: SelectSubset<T, NoteCreateArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notes.
     * @param {NoteCreateManyArgs} args - Arguments to create many Notes.
     * @example
     * // Create many Notes
     * const note = await prisma.note.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NoteCreateManyArgs>(args?: SelectSubset<T, NoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notes and returns the data saved in the database.
     * @param {NoteCreateManyAndReturnArgs} args - Arguments to create many Notes.
     * @example
     * // Create many Notes
     * const note = await prisma.note.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notes and only return the `id`
     * const noteWithIdOnly = await prisma.note.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NoteCreateManyAndReturnArgs>(args?: SelectSubset<T, NoteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Note.
     * @param {NoteDeleteArgs} args - Arguments to delete one Note.
     * @example
     * // Delete one Note
     * const Note = await prisma.note.delete({
     *   where: {
     *     // ... filter to delete one Note
     *   }
     * })
     * 
     */
    delete<T extends NoteDeleteArgs>(args: SelectSubset<T, NoteDeleteArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Note.
     * @param {NoteUpdateArgs} args - Arguments to update one Note.
     * @example
     * // Update one Note
     * const note = await prisma.note.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NoteUpdateArgs>(args: SelectSubset<T, NoteUpdateArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notes.
     * @param {NoteDeleteManyArgs} args - Arguments to filter Notes to delete.
     * @example
     * // Delete a few Notes
     * const { count } = await prisma.note.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NoteDeleteManyArgs>(args?: SelectSubset<T, NoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notes
     * const note = await prisma.note.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NoteUpdateManyArgs>(args: SelectSubset<T, NoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notes and returns the data updated in the database.
     * @param {NoteUpdateManyAndReturnArgs} args - Arguments to update many Notes.
     * @example
     * // Update many Notes
     * const note = await prisma.note.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notes and only return the `id`
     * const noteWithIdOnly = await prisma.note.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NoteUpdateManyAndReturnArgs>(args: SelectSubset<T, NoteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Note.
     * @param {NoteUpsertArgs} args - Arguments to update or create a Note.
     * @example
     * // Update or create a Note
     * const note = await prisma.note.upsert({
     *   create: {
     *     // ... data to create a Note
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Note we want to update
     *   }
     * })
     */
    upsert<T extends NoteUpsertArgs>(args: SelectSubset<T, NoteUpsertArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteCountArgs} args - Arguments to filter Notes to count.
     * @example
     * // Count the number of Notes
     * const count = await prisma.note.count({
     *   where: {
     *     // ... the filter for the Notes we want to count
     *   }
     * })
    **/
    count<T extends NoteCountArgs>(
      args?: Subset<T, NoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Note.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NoteAggregateArgs>(args: Subset<T, NoteAggregateArgs>): Prisma.PrismaPromise<GetNoteAggregateType<T>>

    /**
     * Group by Note.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NoteGroupByArgs['orderBy'] }
        : { orderBy?: NoteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Note model
   */
  readonly fields: NoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Note.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    episode<T extends EpisodeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EpisodeDefaultArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Note model
   */
  interface NoteFieldRefs {
    readonly id: FieldRef<"Note", 'String'>
    readonly episodeId: FieldRef<"Note", 'String'>
    readonly subjective: FieldRef<"Note", 'String'>
    readonly objective: FieldRef<"Note", 'String'>
    readonly assessment: FieldRef<"Note", 'String'>
    readonly plan: FieldRef<"Note", 'String'>
    readonly status: FieldRef<"Note", 'String'>
    readonly createdBy: FieldRef<"Note", 'String'>
    readonly createdAt: FieldRef<"Note", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Note findUnique
   */
  export type NoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * Filter, which Note to fetch.
     */
    where: NoteWhereUniqueInput
  }

  /**
   * Note findUniqueOrThrow
   */
  export type NoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * Filter, which Note to fetch.
     */
    where: NoteWhereUniqueInput
  }

  /**
   * Note findFirst
   */
  export type NoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * Filter, which Note to fetch.
     */
    where?: NoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notes to fetch.
     */
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notes.
     */
    cursor?: NoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notes.
     */
    distinct?: NoteScalarFieldEnum | NoteScalarFieldEnum[]
  }

  /**
   * Note findFirstOrThrow
   */
  export type NoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * Filter, which Note to fetch.
     */
    where?: NoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notes to fetch.
     */
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notes.
     */
    cursor?: NoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notes.
     */
    distinct?: NoteScalarFieldEnum | NoteScalarFieldEnum[]
  }

  /**
   * Note findMany
   */
  export type NoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * Filter, which Notes to fetch.
     */
    where?: NoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notes to fetch.
     */
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notes.
     */
    cursor?: NoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notes.
     */
    distinct?: NoteScalarFieldEnum | NoteScalarFieldEnum[]
  }

  /**
   * Note create
   */
  export type NoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * The data needed to create a Note.
     */
    data: XOR<NoteCreateInput, NoteUncheckedCreateInput>
  }

  /**
   * Note createMany
   */
  export type NoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notes.
     */
    data: NoteCreateManyInput | NoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Note createManyAndReturn
   */
  export type NoteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * The data used to create many Notes.
     */
    data: NoteCreateManyInput | NoteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Note update
   */
  export type NoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * The data needed to update a Note.
     */
    data: XOR<NoteUpdateInput, NoteUncheckedUpdateInput>
    /**
     * Choose, which Note to update.
     */
    where: NoteWhereUniqueInput
  }

  /**
   * Note updateMany
   */
  export type NoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notes.
     */
    data: XOR<NoteUpdateManyMutationInput, NoteUncheckedUpdateManyInput>
    /**
     * Filter which Notes to update
     */
    where?: NoteWhereInput
    /**
     * Limit how many Notes to update.
     */
    limit?: number
  }

  /**
   * Note updateManyAndReturn
   */
  export type NoteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * The data used to update Notes.
     */
    data: XOR<NoteUpdateManyMutationInput, NoteUncheckedUpdateManyInput>
    /**
     * Filter which Notes to update
     */
    where?: NoteWhereInput
    /**
     * Limit how many Notes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Note upsert
   */
  export type NoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * The filter to search for the Note to update in case it exists.
     */
    where: NoteWhereUniqueInput
    /**
     * In case the Note found by the `where` argument doesn't exist, create a new Note with this data.
     */
    create: XOR<NoteCreateInput, NoteUncheckedCreateInput>
    /**
     * In case the Note was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NoteUpdateInput, NoteUncheckedUpdateInput>
  }

  /**
   * Note delete
   */
  export type NoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
    /**
     * Filter which Note to delete.
     */
    where: NoteWhereUniqueInput
  }

  /**
   * Note deleteMany
   */
  export type NoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notes to delete
     */
    where?: NoteWhereInput
    /**
     * Limit how many Notes to delete.
     */
    limit?: number
  }

  /**
   * Note without action
   */
  export type NoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NoteInclude<ExtArgs> | null
  }


  /**
   * Model VitalSign
   */

  export type AggregateVitalSign = {
    _count: VitalSignCountAggregateOutputType | null
    _avg: VitalSignAvgAggregateOutputType | null
    _sum: VitalSignSumAggregateOutputType | null
    _min: VitalSignMinAggregateOutputType | null
    _max: VitalSignMaxAggregateOutputType | null
  }

  export type VitalSignAvgAggregateOutputType = {
    systolic: number | null
    diastolic: number | null
    heartRate: number | null
    respiratoryRate: number | null
    temperature: number | null
    oxygenSat: number | null
    glucose: number | null
    painScale: number | null
  }

  export type VitalSignSumAggregateOutputType = {
    systolic: number | null
    diastolic: number | null
    heartRate: number | null
    respiratoryRate: number | null
    temperature: number | null
    oxygenSat: number | null
    glucose: number | null
    painScale: number | null
  }

  export type VitalSignMinAggregateOutputType = {
    id: string | null
    episodeId: string | null
    systolic: number | null
    diastolic: number | null
    heartRate: number | null
    respiratoryRate: number | null
    temperature: number | null
    oxygenSat: number | null
    glucose: number | null
    painScale: number | null
    recordedBy: string | null
    createdAt: Date | null
  }

  export type VitalSignMaxAggregateOutputType = {
    id: string | null
    episodeId: string | null
    systolic: number | null
    diastolic: number | null
    heartRate: number | null
    respiratoryRate: number | null
    temperature: number | null
    oxygenSat: number | null
    glucose: number | null
    painScale: number | null
    recordedBy: string | null
    createdAt: Date | null
  }

  export type VitalSignCountAggregateOutputType = {
    id: number
    episodeId: number
    systolic: number
    diastolic: number
    heartRate: number
    respiratoryRate: number
    temperature: number
    oxygenSat: number
    glucose: number
    painScale: number
    recordedBy: number
    createdAt: number
    _all: number
  }


  export type VitalSignAvgAggregateInputType = {
    systolic?: true
    diastolic?: true
    heartRate?: true
    respiratoryRate?: true
    temperature?: true
    oxygenSat?: true
    glucose?: true
    painScale?: true
  }

  export type VitalSignSumAggregateInputType = {
    systolic?: true
    diastolic?: true
    heartRate?: true
    respiratoryRate?: true
    temperature?: true
    oxygenSat?: true
    glucose?: true
    painScale?: true
  }

  export type VitalSignMinAggregateInputType = {
    id?: true
    episodeId?: true
    systolic?: true
    diastolic?: true
    heartRate?: true
    respiratoryRate?: true
    temperature?: true
    oxygenSat?: true
    glucose?: true
    painScale?: true
    recordedBy?: true
    createdAt?: true
  }

  export type VitalSignMaxAggregateInputType = {
    id?: true
    episodeId?: true
    systolic?: true
    diastolic?: true
    heartRate?: true
    respiratoryRate?: true
    temperature?: true
    oxygenSat?: true
    glucose?: true
    painScale?: true
    recordedBy?: true
    createdAt?: true
  }

  export type VitalSignCountAggregateInputType = {
    id?: true
    episodeId?: true
    systolic?: true
    diastolic?: true
    heartRate?: true
    respiratoryRate?: true
    temperature?: true
    oxygenSat?: true
    glucose?: true
    painScale?: true
    recordedBy?: true
    createdAt?: true
    _all?: true
  }

  export type VitalSignAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VitalSign to aggregate.
     */
    where?: VitalSignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VitalSigns to fetch.
     */
    orderBy?: VitalSignOrderByWithRelationInput | VitalSignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VitalSignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VitalSigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VitalSigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VitalSigns
    **/
    _count?: true | VitalSignCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VitalSignAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VitalSignSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VitalSignMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VitalSignMaxAggregateInputType
  }

  export type GetVitalSignAggregateType<T extends VitalSignAggregateArgs> = {
        [P in keyof T & keyof AggregateVitalSign]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVitalSign[P]>
      : GetScalarType<T[P], AggregateVitalSign[P]>
  }




  export type VitalSignGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VitalSignWhereInput
    orderBy?: VitalSignOrderByWithAggregationInput | VitalSignOrderByWithAggregationInput[]
    by: VitalSignScalarFieldEnum[] | VitalSignScalarFieldEnum
    having?: VitalSignScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VitalSignCountAggregateInputType | true
    _avg?: VitalSignAvgAggregateInputType
    _sum?: VitalSignSumAggregateInputType
    _min?: VitalSignMinAggregateInputType
    _max?: VitalSignMaxAggregateInputType
  }

  export type VitalSignGroupByOutputType = {
    id: string
    episodeId: string
    systolic: number | null
    diastolic: number | null
    heartRate: number | null
    respiratoryRate: number | null
    temperature: number | null
    oxygenSat: number | null
    glucose: number | null
    painScale: number | null
    recordedBy: string
    createdAt: Date
    _count: VitalSignCountAggregateOutputType | null
    _avg: VitalSignAvgAggregateOutputType | null
    _sum: VitalSignSumAggregateOutputType | null
    _min: VitalSignMinAggregateOutputType | null
    _max: VitalSignMaxAggregateOutputType | null
  }

  type GetVitalSignGroupByPayload<T extends VitalSignGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VitalSignGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VitalSignGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VitalSignGroupByOutputType[P]>
            : GetScalarType<T[P], VitalSignGroupByOutputType[P]>
        }
      >
    >


  export type VitalSignSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    systolic?: boolean
    diastolic?: boolean
    heartRate?: boolean
    respiratoryRate?: boolean
    temperature?: boolean
    oxygenSat?: boolean
    glucose?: boolean
    painScale?: boolean
    recordedBy?: boolean
    createdAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vitalSign"]>

  export type VitalSignSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    systolic?: boolean
    diastolic?: boolean
    heartRate?: boolean
    respiratoryRate?: boolean
    temperature?: boolean
    oxygenSat?: boolean
    glucose?: boolean
    painScale?: boolean
    recordedBy?: boolean
    createdAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vitalSign"]>

  export type VitalSignSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    systolic?: boolean
    diastolic?: boolean
    heartRate?: boolean
    respiratoryRate?: boolean
    temperature?: boolean
    oxygenSat?: boolean
    glucose?: boolean
    painScale?: boolean
    recordedBy?: boolean
    createdAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vitalSign"]>

  export type VitalSignSelectScalar = {
    id?: boolean
    episodeId?: boolean
    systolic?: boolean
    diastolic?: boolean
    heartRate?: boolean
    respiratoryRate?: boolean
    temperature?: boolean
    oxygenSat?: boolean
    glucose?: boolean
    painScale?: boolean
    recordedBy?: boolean
    createdAt?: boolean
  }

  export type VitalSignOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "episodeId" | "systolic" | "diastolic" | "heartRate" | "respiratoryRate" | "temperature" | "oxygenSat" | "glucose" | "painScale" | "recordedBy" | "createdAt", ExtArgs["result"]["vitalSign"]>
  export type VitalSignInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }
  export type VitalSignIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }
  export type VitalSignIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }

  export type $VitalSignPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VitalSign"
    objects: {
      episode: Prisma.$EpisodePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      episodeId: string
      systolic: number | null
      diastolic: number | null
      heartRate: number | null
      respiratoryRate: number | null
      temperature: number | null
      oxygenSat: number | null
      glucose: number | null
      painScale: number | null
      recordedBy: string
      createdAt: Date
    }, ExtArgs["result"]["vitalSign"]>
    composites: {}
  }

  type VitalSignGetPayload<S extends boolean | null | undefined | VitalSignDefaultArgs> = $Result.GetResult<Prisma.$VitalSignPayload, S>

  type VitalSignCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VitalSignFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VitalSignCountAggregateInputType | true
    }

  export interface VitalSignDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VitalSign'], meta: { name: 'VitalSign' } }
    /**
     * Find zero or one VitalSign that matches the filter.
     * @param {VitalSignFindUniqueArgs} args - Arguments to find a VitalSign
     * @example
     * // Get one VitalSign
     * const vitalSign = await prisma.vitalSign.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VitalSignFindUniqueArgs>(args: SelectSubset<T, VitalSignFindUniqueArgs<ExtArgs>>): Prisma__VitalSignClient<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VitalSign that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VitalSignFindUniqueOrThrowArgs} args - Arguments to find a VitalSign
     * @example
     * // Get one VitalSign
     * const vitalSign = await prisma.vitalSign.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VitalSignFindUniqueOrThrowArgs>(args: SelectSubset<T, VitalSignFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VitalSignClient<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VitalSign that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VitalSignFindFirstArgs} args - Arguments to find a VitalSign
     * @example
     * // Get one VitalSign
     * const vitalSign = await prisma.vitalSign.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VitalSignFindFirstArgs>(args?: SelectSubset<T, VitalSignFindFirstArgs<ExtArgs>>): Prisma__VitalSignClient<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VitalSign that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VitalSignFindFirstOrThrowArgs} args - Arguments to find a VitalSign
     * @example
     * // Get one VitalSign
     * const vitalSign = await prisma.vitalSign.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VitalSignFindFirstOrThrowArgs>(args?: SelectSubset<T, VitalSignFindFirstOrThrowArgs<ExtArgs>>): Prisma__VitalSignClient<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VitalSigns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VitalSignFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VitalSigns
     * const vitalSigns = await prisma.vitalSign.findMany()
     * 
     * // Get first 10 VitalSigns
     * const vitalSigns = await prisma.vitalSign.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vitalSignWithIdOnly = await prisma.vitalSign.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VitalSignFindManyArgs>(args?: SelectSubset<T, VitalSignFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VitalSign.
     * @param {VitalSignCreateArgs} args - Arguments to create a VitalSign.
     * @example
     * // Create one VitalSign
     * const VitalSign = await prisma.vitalSign.create({
     *   data: {
     *     // ... data to create a VitalSign
     *   }
     * })
     * 
     */
    create<T extends VitalSignCreateArgs>(args: SelectSubset<T, VitalSignCreateArgs<ExtArgs>>): Prisma__VitalSignClient<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VitalSigns.
     * @param {VitalSignCreateManyArgs} args - Arguments to create many VitalSigns.
     * @example
     * // Create many VitalSigns
     * const vitalSign = await prisma.vitalSign.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VitalSignCreateManyArgs>(args?: SelectSubset<T, VitalSignCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VitalSigns and returns the data saved in the database.
     * @param {VitalSignCreateManyAndReturnArgs} args - Arguments to create many VitalSigns.
     * @example
     * // Create many VitalSigns
     * const vitalSign = await prisma.vitalSign.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VitalSigns and only return the `id`
     * const vitalSignWithIdOnly = await prisma.vitalSign.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VitalSignCreateManyAndReturnArgs>(args?: SelectSubset<T, VitalSignCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VitalSign.
     * @param {VitalSignDeleteArgs} args - Arguments to delete one VitalSign.
     * @example
     * // Delete one VitalSign
     * const VitalSign = await prisma.vitalSign.delete({
     *   where: {
     *     // ... filter to delete one VitalSign
     *   }
     * })
     * 
     */
    delete<T extends VitalSignDeleteArgs>(args: SelectSubset<T, VitalSignDeleteArgs<ExtArgs>>): Prisma__VitalSignClient<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VitalSign.
     * @param {VitalSignUpdateArgs} args - Arguments to update one VitalSign.
     * @example
     * // Update one VitalSign
     * const vitalSign = await prisma.vitalSign.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VitalSignUpdateArgs>(args: SelectSubset<T, VitalSignUpdateArgs<ExtArgs>>): Prisma__VitalSignClient<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VitalSigns.
     * @param {VitalSignDeleteManyArgs} args - Arguments to filter VitalSigns to delete.
     * @example
     * // Delete a few VitalSigns
     * const { count } = await prisma.vitalSign.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VitalSignDeleteManyArgs>(args?: SelectSubset<T, VitalSignDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VitalSigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VitalSignUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VitalSigns
     * const vitalSign = await prisma.vitalSign.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VitalSignUpdateManyArgs>(args: SelectSubset<T, VitalSignUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VitalSigns and returns the data updated in the database.
     * @param {VitalSignUpdateManyAndReturnArgs} args - Arguments to update many VitalSigns.
     * @example
     * // Update many VitalSigns
     * const vitalSign = await prisma.vitalSign.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VitalSigns and only return the `id`
     * const vitalSignWithIdOnly = await prisma.vitalSign.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VitalSignUpdateManyAndReturnArgs>(args: SelectSubset<T, VitalSignUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VitalSign.
     * @param {VitalSignUpsertArgs} args - Arguments to update or create a VitalSign.
     * @example
     * // Update or create a VitalSign
     * const vitalSign = await prisma.vitalSign.upsert({
     *   create: {
     *     // ... data to create a VitalSign
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VitalSign we want to update
     *   }
     * })
     */
    upsert<T extends VitalSignUpsertArgs>(args: SelectSubset<T, VitalSignUpsertArgs<ExtArgs>>): Prisma__VitalSignClient<$Result.GetResult<Prisma.$VitalSignPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VitalSigns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VitalSignCountArgs} args - Arguments to filter VitalSigns to count.
     * @example
     * // Count the number of VitalSigns
     * const count = await prisma.vitalSign.count({
     *   where: {
     *     // ... the filter for the VitalSigns we want to count
     *   }
     * })
    **/
    count<T extends VitalSignCountArgs>(
      args?: Subset<T, VitalSignCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VitalSignCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VitalSign.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VitalSignAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VitalSignAggregateArgs>(args: Subset<T, VitalSignAggregateArgs>): Prisma.PrismaPromise<GetVitalSignAggregateType<T>>

    /**
     * Group by VitalSign.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VitalSignGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VitalSignGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VitalSignGroupByArgs['orderBy'] }
        : { orderBy?: VitalSignGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VitalSignGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVitalSignGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VitalSign model
   */
  readonly fields: VitalSignFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VitalSign.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VitalSignClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    episode<T extends EpisodeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EpisodeDefaultArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VitalSign model
   */
  interface VitalSignFieldRefs {
    readonly id: FieldRef<"VitalSign", 'String'>
    readonly episodeId: FieldRef<"VitalSign", 'String'>
    readonly systolic: FieldRef<"VitalSign", 'Int'>
    readonly diastolic: FieldRef<"VitalSign", 'Int'>
    readonly heartRate: FieldRef<"VitalSign", 'Int'>
    readonly respiratoryRate: FieldRef<"VitalSign", 'Int'>
    readonly temperature: FieldRef<"VitalSign", 'Float'>
    readonly oxygenSat: FieldRef<"VitalSign", 'Int'>
    readonly glucose: FieldRef<"VitalSign", 'Int'>
    readonly painScale: FieldRef<"VitalSign", 'Int'>
    readonly recordedBy: FieldRef<"VitalSign", 'String'>
    readonly createdAt: FieldRef<"VitalSign", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VitalSign findUnique
   */
  export type VitalSignFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * Filter, which VitalSign to fetch.
     */
    where: VitalSignWhereUniqueInput
  }

  /**
   * VitalSign findUniqueOrThrow
   */
  export type VitalSignFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * Filter, which VitalSign to fetch.
     */
    where: VitalSignWhereUniqueInput
  }

  /**
   * VitalSign findFirst
   */
  export type VitalSignFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * Filter, which VitalSign to fetch.
     */
    where?: VitalSignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VitalSigns to fetch.
     */
    orderBy?: VitalSignOrderByWithRelationInput | VitalSignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VitalSigns.
     */
    cursor?: VitalSignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VitalSigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VitalSigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VitalSigns.
     */
    distinct?: VitalSignScalarFieldEnum | VitalSignScalarFieldEnum[]
  }

  /**
   * VitalSign findFirstOrThrow
   */
  export type VitalSignFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * Filter, which VitalSign to fetch.
     */
    where?: VitalSignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VitalSigns to fetch.
     */
    orderBy?: VitalSignOrderByWithRelationInput | VitalSignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VitalSigns.
     */
    cursor?: VitalSignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VitalSigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VitalSigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VitalSigns.
     */
    distinct?: VitalSignScalarFieldEnum | VitalSignScalarFieldEnum[]
  }

  /**
   * VitalSign findMany
   */
  export type VitalSignFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * Filter, which VitalSigns to fetch.
     */
    where?: VitalSignWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VitalSigns to fetch.
     */
    orderBy?: VitalSignOrderByWithRelationInput | VitalSignOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VitalSigns.
     */
    cursor?: VitalSignWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VitalSigns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VitalSigns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VitalSigns.
     */
    distinct?: VitalSignScalarFieldEnum | VitalSignScalarFieldEnum[]
  }

  /**
   * VitalSign create
   */
  export type VitalSignCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * The data needed to create a VitalSign.
     */
    data: XOR<VitalSignCreateInput, VitalSignUncheckedCreateInput>
  }

  /**
   * VitalSign createMany
   */
  export type VitalSignCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VitalSigns.
     */
    data: VitalSignCreateManyInput | VitalSignCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VitalSign createManyAndReturn
   */
  export type VitalSignCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * The data used to create many VitalSigns.
     */
    data: VitalSignCreateManyInput | VitalSignCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VitalSign update
   */
  export type VitalSignUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * The data needed to update a VitalSign.
     */
    data: XOR<VitalSignUpdateInput, VitalSignUncheckedUpdateInput>
    /**
     * Choose, which VitalSign to update.
     */
    where: VitalSignWhereUniqueInput
  }

  /**
   * VitalSign updateMany
   */
  export type VitalSignUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VitalSigns.
     */
    data: XOR<VitalSignUpdateManyMutationInput, VitalSignUncheckedUpdateManyInput>
    /**
     * Filter which VitalSigns to update
     */
    where?: VitalSignWhereInput
    /**
     * Limit how many VitalSigns to update.
     */
    limit?: number
  }

  /**
   * VitalSign updateManyAndReturn
   */
  export type VitalSignUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * The data used to update VitalSigns.
     */
    data: XOR<VitalSignUpdateManyMutationInput, VitalSignUncheckedUpdateManyInput>
    /**
     * Filter which VitalSigns to update
     */
    where?: VitalSignWhereInput
    /**
     * Limit how many VitalSigns to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * VitalSign upsert
   */
  export type VitalSignUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * The filter to search for the VitalSign to update in case it exists.
     */
    where: VitalSignWhereUniqueInput
    /**
     * In case the VitalSign found by the `where` argument doesn't exist, create a new VitalSign with this data.
     */
    create: XOR<VitalSignCreateInput, VitalSignUncheckedCreateInput>
    /**
     * In case the VitalSign was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VitalSignUpdateInput, VitalSignUncheckedUpdateInput>
  }

  /**
   * VitalSign delete
   */
  export type VitalSignDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
    /**
     * Filter which VitalSign to delete.
     */
    where: VitalSignWhereUniqueInput
  }

  /**
   * VitalSign deleteMany
   */
  export type VitalSignDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VitalSigns to delete
     */
    where?: VitalSignWhereInput
    /**
     * Limit how many VitalSigns to delete.
     */
    limit?: number
  }

  /**
   * VitalSign without action
   */
  export type VitalSignDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VitalSign
     */
    select?: VitalSignSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VitalSign
     */
    omit?: VitalSignOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VitalSignInclude<ExtArgs> | null
  }


  /**
   * Model Handoff
   */

  export type AggregateHandoff = {
    _count: HandoffCountAggregateOutputType | null
    _min: HandoffMinAggregateOutputType | null
    _max: HandoffMaxAggregateOutputType | null
  }

  export type HandoffMinAggregateOutputType = {
    id: string | null
    episodeId: string | null
    entregadoPor: string | null
    recibidoPor: string | null
    observaciones: string | null
    status: $Enums.HandoffStatus | null
    createdAt: Date | null
    aceptadoAt: Date | null
  }

  export type HandoffMaxAggregateOutputType = {
    id: string | null
    episodeId: string | null
    entregadoPor: string | null
    recibidoPor: string | null
    observaciones: string | null
    status: $Enums.HandoffStatus | null
    createdAt: Date | null
    aceptadoAt: Date | null
  }

  export type HandoffCountAggregateOutputType = {
    id: number
    episodeId: number
    entregadoPor: number
    recibidoPor: number
    observaciones: number
    status: number
    createdAt: number
    aceptadoAt: number
    _all: number
  }


  export type HandoffMinAggregateInputType = {
    id?: true
    episodeId?: true
    entregadoPor?: true
    recibidoPor?: true
    observaciones?: true
    status?: true
    createdAt?: true
    aceptadoAt?: true
  }

  export type HandoffMaxAggregateInputType = {
    id?: true
    episodeId?: true
    entregadoPor?: true
    recibidoPor?: true
    observaciones?: true
    status?: true
    createdAt?: true
    aceptadoAt?: true
  }

  export type HandoffCountAggregateInputType = {
    id?: true
    episodeId?: true
    entregadoPor?: true
    recibidoPor?: true
    observaciones?: true
    status?: true
    createdAt?: true
    aceptadoAt?: true
    _all?: true
  }

  export type HandoffAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Handoff to aggregate.
     */
    where?: HandoffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Handoffs to fetch.
     */
    orderBy?: HandoffOrderByWithRelationInput | HandoffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HandoffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Handoffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Handoffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Handoffs
    **/
    _count?: true | HandoffCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HandoffMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HandoffMaxAggregateInputType
  }

  export type GetHandoffAggregateType<T extends HandoffAggregateArgs> = {
        [P in keyof T & keyof AggregateHandoff]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHandoff[P]>
      : GetScalarType<T[P], AggregateHandoff[P]>
  }




  export type HandoffGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HandoffWhereInput
    orderBy?: HandoffOrderByWithAggregationInput | HandoffOrderByWithAggregationInput[]
    by: HandoffScalarFieldEnum[] | HandoffScalarFieldEnum
    having?: HandoffScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HandoffCountAggregateInputType | true
    _min?: HandoffMinAggregateInputType
    _max?: HandoffMaxAggregateInputType
  }

  export type HandoffGroupByOutputType = {
    id: string
    episodeId: string
    entregadoPor: string
    recibidoPor: string
    observaciones: string | null
    status: $Enums.HandoffStatus
    createdAt: Date
    aceptadoAt: Date | null
    _count: HandoffCountAggregateOutputType | null
    _min: HandoffMinAggregateOutputType | null
    _max: HandoffMaxAggregateOutputType | null
  }

  type GetHandoffGroupByPayload<T extends HandoffGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HandoffGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HandoffGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HandoffGroupByOutputType[P]>
            : GetScalarType<T[P], HandoffGroupByOutputType[P]>
        }
      >
    >


  export type HandoffSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    entregadoPor?: boolean
    recibidoPor?: boolean
    observaciones?: boolean
    status?: boolean
    createdAt?: boolean
    aceptadoAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["handoff"]>

  export type HandoffSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    entregadoPor?: boolean
    recibidoPor?: boolean
    observaciones?: boolean
    status?: boolean
    createdAt?: boolean
    aceptadoAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["handoff"]>

  export type HandoffSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    episodeId?: boolean
    entregadoPor?: boolean
    recibidoPor?: boolean
    observaciones?: boolean
    status?: boolean
    createdAt?: boolean
    aceptadoAt?: boolean
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["handoff"]>

  export type HandoffSelectScalar = {
    id?: boolean
    episodeId?: boolean
    entregadoPor?: boolean
    recibidoPor?: boolean
    observaciones?: boolean
    status?: boolean
    createdAt?: boolean
    aceptadoAt?: boolean
  }

  export type HandoffOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "episodeId" | "entregadoPor" | "recibidoPor" | "observaciones" | "status" | "createdAt" | "aceptadoAt", ExtArgs["result"]["handoff"]>
  export type HandoffInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }
  export type HandoffIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }
  export type HandoffIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    episode?: boolean | EpisodeDefaultArgs<ExtArgs>
  }

  export type $HandoffPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Handoff"
    objects: {
      episode: Prisma.$EpisodePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      episodeId: string
      entregadoPor: string
      recibidoPor: string
      observaciones: string | null
      status: $Enums.HandoffStatus
      createdAt: Date
      aceptadoAt: Date | null
    }, ExtArgs["result"]["handoff"]>
    composites: {}
  }

  type HandoffGetPayload<S extends boolean | null | undefined | HandoffDefaultArgs> = $Result.GetResult<Prisma.$HandoffPayload, S>

  type HandoffCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HandoffFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HandoffCountAggregateInputType | true
    }

  export interface HandoffDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Handoff'], meta: { name: 'Handoff' } }
    /**
     * Find zero or one Handoff that matches the filter.
     * @param {HandoffFindUniqueArgs} args - Arguments to find a Handoff
     * @example
     * // Get one Handoff
     * const handoff = await prisma.handoff.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HandoffFindUniqueArgs>(args: SelectSubset<T, HandoffFindUniqueArgs<ExtArgs>>): Prisma__HandoffClient<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Handoff that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HandoffFindUniqueOrThrowArgs} args - Arguments to find a Handoff
     * @example
     * // Get one Handoff
     * const handoff = await prisma.handoff.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HandoffFindUniqueOrThrowArgs>(args: SelectSubset<T, HandoffFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HandoffClient<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Handoff that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HandoffFindFirstArgs} args - Arguments to find a Handoff
     * @example
     * // Get one Handoff
     * const handoff = await prisma.handoff.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HandoffFindFirstArgs>(args?: SelectSubset<T, HandoffFindFirstArgs<ExtArgs>>): Prisma__HandoffClient<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Handoff that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HandoffFindFirstOrThrowArgs} args - Arguments to find a Handoff
     * @example
     * // Get one Handoff
     * const handoff = await prisma.handoff.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HandoffFindFirstOrThrowArgs>(args?: SelectSubset<T, HandoffFindFirstOrThrowArgs<ExtArgs>>): Prisma__HandoffClient<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Handoffs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HandoffFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Handoffs
     * const handoffs = await prisma.handoff.findMany()
     * 
     * // Get first 10 Handoffs
     * const handoffs = await prisma.handoff.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const handoffWithIdOnly = await prisma.handoff.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HandoffFindManyArgs>(args?: SelectSubset<T, HandoffFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Handoff.
     * @param {HandoffCreateArgs} args - Arguments to create a Handoff.
     * @example
     * // Create one Handoff
     * const Handoff = await prisma.handoff.create({
     *   data: {
     *     // ... data to create a Handoff
     *   }
     * })
     * 
     */
    create<T extends HandoffCreateArgs>(args: SelectSubset<T, HandoffCreateArgs<ExtArgs>>): Prisma__HandoffClient<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Handoffs.
     * @param {HandoffCreateManyArgs} args - Arguments to create many Handoffs.
     * @example
     * // Create many Handoffs
     * const handoff = await prisma.handoff.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HandoffCreateManyArgs>(args?: SelectSubset<T, HandoffCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Handoffs and returns the data saved in the database.
     * @param {HandoffCreateManyAndReturnArgs} args - Arguments to create many Handoffs.
     * @example
     * // Create many Handoffs
     * const handoff = await prisma.handoff.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Handoffs and only return the `id`
     * const handoffWithIdOnly = await prisma.handoff.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HandoffCreateManyAndReturnArgs>(args?: SelectSubset<T, HandoffCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Handoff.
     * @param {HandoffDeleteArgs} args - Arguments to delete one Handoff.
     * @example
     * // Delete one Handoff
     * const Handoff = await prisma.handoff.delete({
     *   where: {
     *     // ... filter to delete one Handoff
     *   }
     * })
     * 
     */
    delete<T extends HandoffDeleteArgs>(args: SelectSubset<T, HandoffDeleteArgs<ExtArgs>>): Prisma__HandoffClient<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Handoff.
     * @param {HandoffUpdateArgs} args - Arguments to update one Handoff.
     * @example
     * // Update one Handoff
     * const handoff = await prisma.handoff.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HandoffUpdateArgs>(args: SelectSubset<T, HandoffUpdateArgs<ExtArgs>>): Prisma__HandoffClient<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Handoffs.
     * @param {HandoffDeleteManyArgs} args - Arguments to filter Handoffs to delete.
     * @example
     * // Delete a few Handoffs
     * const { count } = await prisma.handoff.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HandoffDeleteManyArgs>(args?: SelectSubset<T, HandoffDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Handoffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HandoffUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Handoffs
     * const handoff = await prisma.handoff.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HandoffUpdateManyArgs>(args: SelectSubset<T, HandoffUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Handoffs and returns the data updated in the database.
     * @param {HandoffUpdateManyAndReturnArgs} args - Arguments to update many Handoffs.
     * @example
     * // Update many Handoffs
     * const handoff = await prisma.handoff.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Handoffs and only return the `id`
     * const handoffWithIdOnly = await prisma.handoff.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends HandoffUpdateManyAndReturnArgs>(args: SelectSubset<T, HandoffUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Handoff.
     * @param {HandoffUpsertArgs} args - Arguments to update or create a Handoff.
     * @example
     * // Update or create a Handoff
     * const handoff = await prisma.handoff.upsert({
     *   create: {
     *     // ... data to create a Handoff
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Handoff we want to update
     *   }
     * })
     */
    upsert<T extends HandoffUpsertArgs>(args: SelectSubset<T, HandoffUpsertArgs<ExtArgs>>): Prisma__HandoffClient<$Result.GetResult<Prisma.$HandoffPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Handoffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HandoffCountArgs} args - Arguments to filter Handoffs to count.
     * @example
     * // Count the number of Handoffs
     * const count = await prisma.handoff.count({
     *   where: {
     *     // ... the filter for the Handoffs we want to count
     *   }
     * })
    **/
    count<T extends HandoffCountArgs>(
      args?: Subset<T, HandoffCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HandoffCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Handoff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HandoffAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HandoffAggregateArgs>(args: Subset<T, HandoffAggregateArgs>): Prisma.PrismaPromise<GetHandoffAggregateType<T>>

    /**
     * Group by Handoff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HandoffGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HandoffGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HandoffGroupByArgs['orderBy'] }
        : { orderBy?: HandoffGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HandoffGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHandoffGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Handoff model
   */
  readonly fields: HandoffFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Handoff.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HandoffClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    episode<T extends EpisodeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EpisodeDefaultArgs<ExtArgs>>): Prisma__EpisodeClient<$Result.GetResult<Prisma.$EpisodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Handoff model
   */
  interface HandoffFieldRefs {
    readonly id: FieldRef<"Handoff", 'String'>
    readonly episodeId: FieldRef<"Handoff", 'String'>
    readonly entregadoPor: FieldRef<"Handoff", 'String'>
    readonly recibidoPor: FieldRef<"Handoff", 'String'>
    readonly observaciones: FieldRef<"Handoff", 'String'>
    readonly status: FieldRef<"Handoff", 'HandoffStatus'>
    readonly createdAt: FieldRef<"Handoff", 'DateTime'>
    readonly aceptadoAt: FieldRef<"Handoff", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Handoff findUnique
   */
  export type HandoffFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * Filter, which Handoff to fetch.
     */
    where: HandoffWhereUniqueInput
  }

  /**
   * Handoff findUniqueOrThrow
   */
  export type HandoffFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * Filter, which Handoff to fetch.
     */
    where: HandoffWhereUniqueInput
  }

  /**
   * Handoff findFirst
   */
  export type HandoffFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * Filter, which Handoff to fetch.
     */
    where?: HandoffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Handoffs to fetch.
     */
    orderBy?: HandoffOrderByWithRelationInput | HandoffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Handoffs.
     */
    cursor?: HandoffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Handoffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Handoffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Handoffs.
     */
    distinct?: HandoffScalarFieldEnum | HandoffScalarFieldEnum[]
  }

  /**
   * Handoff findFirstOrThrow
   */
  export type HandoffFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * Filter, which Handoff to fetch.
     */
    where?: HandoffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Handoffs to fetch.
     */
    orderBy?: HandoffOrderByWithRelationInput | HandoffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Handoffs.
     */
    cursor?: HandoffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Handoffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Handoffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Handoffs.
     */
    distinct?: HandoffScalarFieldEnum | HandoffScalarFieldEnum[]
  }

  /**
   * Handoff findMany
   */
  export type HandoffFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * Filter, which Handoffs to fetch.
     */
    where?: HandoffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Handoffs to fetch.
     */
    orderBy?: HandoffOrderByWithRelationInput | HandoffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Handoffs.
     */
    cursor?: HandoffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Handoffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Handoffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Handoffs.
     */
    distinct?: HandoffScalarFieldEnum | HandoffScalarFieldEnum[]
  }

  /**
   * Handoff create
   */
  export type HandoffCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * The data needed to create a Handoff.
     */
    data: XOR<HandoffCreateInput, HandoffUncheckedCreateInput>
  }

  /**
   * Handoff createMany
   */
  export type HandoffCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Handoffs.
     */
    data: HandoffCreateManyInput | HandoffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Handoff createManyAndReturn
   */
  export type HandoffCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * The data used to create many Handoffs.
     */
    data: HandoffCreateManyInput | HandoffCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Handoff update
   */
  export type HandoffUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * The data needed to update a Handoff.
     */
    data: XOR<HandoffUpdateInput, HandoffUncheckedUpdateInput>
    /**
     * Choose, which Handoff to update.
     */
    where: HandoffWhereUniqueInput
  }

  /**
   * Handoff updateMany
   */
  export type HandoffUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Handoffs.
     */
    data: XOR<HandoffUpdateManyMutationInput, HandoffUncheckedUpdateManyInput>
    /**
     * Filter which Handoffs to update
     */
    where?: HandoffWhereInput
    /**
     * Limit how many Handoffs to update.
     */
    limit?: number
  }

  /**
   * Handoff updateManyAndReturn
   */
  export type HandoffUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * The data used to update Handoffs.
     */
    data: XOR<HandoffUpdateManyMutationInput, HandoffUncheckedUpdateManyInput>
    /**
     * Filter which Handoffs to update
     */
    where?: HandoffWhereInput
    /**
     * Limit how many Handoffs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Handoff upsert
   */
  export type HandoffUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * The filter to search for the Handoff to update in case it exists.
     */
    where: HandoffWhereUniqueInput
    /**
     * In case the Handoff found by the `where` argument doesn't exist, create a new Handoff with this data.
     */
    create: XOR<HandoffCreateInput, HandoffUncheckedCreateInput>
    /**
     * In case the Handoff was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HandoffUpdateInput, HandoffUncheckedUpdateInput>
  }

  /**
   * Handoff delete
   */
  export type HandoffDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
    /**
     * Filter which Handoff to delete.
     */
    where: HandoffWhereUniqueInput
  }

  /**
   * Handoff deleteMany
   */
  export type HandoffDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Handoffs to delete
     */
    where?: HandoffWhereInput
    /**
     * Limit how many Handoffs to delete.
     */
    limit?: number
  }

  /**
   * Handoff without action
   */
  export type HandoffDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Handoff
     */
    select?: HandoffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Handoff
     */
    omit?: HandoffOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HandoffInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    fullName: 'fullName',
    role: 'role',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    seq: 'seq',
    prevHash: 'prevHash',
    entryHash: 'entryHash',
    actorId: 'actorId',
    actorRole: 'actorRole',
    patientId: 'patientId',
    episodeId: 'episodeId',
    action: 'action',
    entity: 'entity',
    entityId: 'entityId',
    oldValue: 'oldValue',
    newValue: 'newValue',
    reason: 'reason',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    serverTs: 'serverTs'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const PatientScalarFieldEnum: {
    id: 'id',
    expedienteNumber: 'expedienteNumber',
    firstName: 'firstName',
    lastName: 'lastName',
    birthDate: 'birthDate',
    age: 'age',
    sex: 'sex',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PatientScalarFieldEnum = (typeof PatientScalarFieldEnum)[keyof typeof PatientScalarFieldEnum]


  export const EpisodeScalarFieldEnum: {
    id: 'id',
    patientId: 'patientId',
    admissionDate: 'admissionDate',
    admissionType: 'admissionType',
    chiefComplaint: 'chiefComplaint',
    status: 'status',
    room: 'room',
    bed: 'bed',
    attendingDoctor: 'attendingDoctor',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EpisodeScalarFieldEnum = (typeof EpisodeScalarFieldEnum)[keyof typeof EpisodeScalarFieldEnum]


  export const AllergyScalarFieldEnum: {
    id: 'id',
    patientId: 'patientId',
    episodeId: 'episodeId',
    allergen: 'allergen',
    type: 'type',
    reaction: 'reaction',
    severity: 'severity',
    status: 'status',
    createdAt: 'createdAt',
    createdBy: 'createdBy'
  };

  export type AllergyScalarFieldEnum = (typeof AllergyScalarFieldEnum)[keyof typeof AllergyScalarFieldEnum]


  export const NoteScalarFieldEnum: {
    id: 'id',
    episodeId: 'episodeId',
    subjective: 'subjective',
    objective: 'objective',
    assessment: 'assessment',
    plan: 'plan',
    status: 'status',
    createdBy: 'createdBy',
    createdAt: 'createdAt'
  };

  export type NoteScalarFieldEnum = (typeof NoteScalarFieldEnum)[keyof typeof NoteScalarFieldEnum]


  export const VitalSignScalarFieldEnum: {
    id: 'id',
    episodeId: 'episodeId',
    systolic: 'systolic',
    diastolic: 'diastolic',
    heartRate: 'heartRate',
    respiratoryRate: 'respiratoryRate',
    temperature: 'temperature',
    oxygenSat: 'oxygenSat',
    glucose: 'glucose',
    painScale: 'painScale',
    recordedBy: 'recordedBy',
    createdAt: 'createdAt'
  };

  export type VitalSignScalarFieldEnum = (typeof VitalSignScalarFieldEnum)[keyof typeof VitalSignScalarFieldEnum]


  export const HandoffScalarFieldEnum: {
    id: 'id',
    episodeId: 'episodeId',
    entregadoPor: 'entregadoPor',
    recibidoPor: 'recibidoPor',
    observaciones: 'observaciones',
    status: 'status',
    createdAt: 'createdAt',
    aceptadoAt: 'aceptadoAt'
  };

  export type HandoffScalarFieldEnum = (typeof HandoffScalarFieldEnum)[keyof typeof HandoffScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'HandoffStatus'
   */
  export type EnumHandoffStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HandoffStatus'>
    


  /**
   * Reference to a field of type 'HandoffStatus[]'
   */
  export type ListEnumHandoffStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HandoffStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    fullName?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    auditEntries?: AuditLogListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    fullName?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    auditEntries?: AuditLogOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    fullName?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    auditEntries?: AuditLogListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    fullName?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    fullName?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: BigIntFilter<"AuditLog"> | bigint | number
    seq?: BigIntFilter<"AuditLog"> | bigint | number
    prevHash?: StringFilter<"AuditLog"> | string
    entryHash?: StringFilter<"AuditLog"> | string
    actorId?: StringFilter<"AuditLog"> | string
    actorRole?: StringFilter<"AuditLog"> | string
    patientId?: StringNullableFilter<"AuditLog"> | string | null
    episodeId?: StringNullableFilter<"AuditLog"> | string | null
    action?: StringFilter<"AuditLog"> | string
    entity?: StringFilter<"AuditLog"> | string
    entityId?: StringNullableFilter<"AuditLog"> | string | null
    oldValue?: JsonNullableFilter<"AuditLog">
    newValue?: JsonNullableFilter<"AuditLog">
    reason?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    serverTs?: DateTimeFilter<"AuditLog"> | Date | string
    actor?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    seq?: SortOrder
    prevHash?: SortOrder
    entryHash?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    patientId?: SortOrderInput | SortOrder
    episodeId?: SortOrderInput | SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrderInput | SortOrder
    oldValue?: SortOrderInput | SortOrder
    newValue?: SortOrderInput | SortOrder
    reason?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    serverTs?: SortOrder
    actor?: UserOrderByWithRelationInput
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    seq?: bigint | number
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    prevHash?: StringFilter<"AuditLog"> | string
    entryHash?: StringFilter<"AuditLog"> | string
    actorId?: StringFilter<"AuditLog"> | string
    actorRole?: StringFilter<"AuditLog"> | string
    patientId?: StringNullableFilter<"AuditLog"> | string | null
    episodeId?: StringNullableFilter<"AuditLog"> | string | null
    action?: StringFilter<"AuditLog"> | string
    entity?: StringFilter<"AuditLog"> | string
    entityId?: StringNullableFilter<"AuditLog"> | string | null
    oldValue?: JsonNullableFilter<"AuditLog">
    newValue?: JsonNullableFilter<"AuditLog">
    reason?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    serverTs?: DateTimeFilter<"AuditLog"> | Date | string
    actor?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "seq">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    seq?: SortOrder
    prevHash?: SortOrder
    entryHash?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    patientId?: SortOrderInput | SortOrder
    episodeId?: SortOrderInput | SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrderInput | SortOrder
    oldValue?: SortOrderInput | SortOrder
    newValue?: SortOrderInput | SortOrder
    reason?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    serverTs?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _avg?: AuditLogAvgOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
    _sum?: AuditLogSumOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"AuditLog"> | bigint | number
    seq?: BigIntWithAggregatesFilter<"AuditLog"> | bigint | number
    prevHash?: StringWithAggregatesFilter<"AuditLog"> | string
    entryHash?: StringWithAggregatesFilter<"AuditLog"> | string
    actorId?: StringWithAggregatesFilter<"AuditLog"> | string
    actorRole?: StringWithAggregatesFilter<"AuditLog"> | string
    patientId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    episodeId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    entity?: StringWithAggregatesFilter<"AuditLog"> | string
    entityId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    oldValue?: JsonNullableWithAggregatesFilter<"AuditLog">
    newValue?: JsonNullableWithAggregatesFilter<"AuditLog">
    reason?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    serverTs?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type PatientWhereInput = {
    AND?: PatientWhereInput | PatientWhereInput[]
    OR?: PatientWhereInput[]
    NOT?: PatientWhereInput | PatientWhereInput[]
    id?: StringFilter<"Patient"> | string
    expedienteNumber?: StringFilter<"Patient"> | string
    firstName?: StringFilter<"Patient"> | string
    lastName?: StringFilter<"Patient"> | string
    birthDate?: DateTimeNullableFilter<"Patient"> | Date | string | null
    age?: IntNullableFilter<"Patient"> | number | null
    sex?: StringFilter<"Patient"> | string
    createdAt?: DateTimeFilter<"Patient"> | Date | string
    updatedAt?: DateTimeFilter<"Patient"> | Date | string
    episodes?: EpisodeListRelationFilter
    allergies?: AllergyListRelationFilter
  }

  export type PatientOrderByWithRelationInput = {
    id?: SortOrder
    expedienteNumber?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    birthDate?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    sex?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    episodes?: EpisodeOrderByRelationAggregateInput
    allergies?: AllergyOrderByRelationAggregateInput
  }

  export type PatientWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    expedienteNumber?: string
    AND?: PatientWhereInput | PatientWhereInput[]
    OR?: PatientWhereInput[]
    NOT?: PatientWhereInput | PatientWhereInput[]
    firstName?: StringFilter<"Patient"> | string
    lastName?: StringFilter<"Patient"> | string
    birthDate?: DateTimeNullableFilter<"Patient"> | Date | string | null
    age?: IntNullableFilter<"Patient"> | number | null
    sex?: StringFilter<"Patient"> | string
    createdAt?: DateTimeFilter<"Patient"> | Date | string
    updatedAt?: DateTimeFilter<"Patient"> | Date | string
    episodes?: EpisodeListRelationFilter
    allergies?: AllergyListRelationFilter
  }, "id" | "expedienteNumber">

  export type PatientOrderByWithAggregationInput = {
    id?: SortOrder
    expedienteNumber?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    birthDate?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    sex?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PatientCountOrderByAggregateInput
    _avg?: PatientAvgOrderByAggregateInput
    _max?: PatientMaxOrderByAggregateInput
    _min?: PatientMinOrderByAggregateInput
    _sum?: PatientSumOrderByAggregateInput
  }

  export type PatientScalarWhereWithAggregatesInput = {
    AND?: PatientScalarWhereWithAggregatesInput | PatientScalarWhereWithAggregatesInput[]
    OR?: PatientScalarWhereWithAggregatesInput[]
    NOT?: PatientScalarWhereWithAggregatesInput | PatientScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Patient"> | string
    expedienteNumber?: StringWithAggregatesFilter<"Patient"> | string
    firstName?: StringWithAggregatesFilter<"Patient"> | string
    lastName?: StringWithAggregatesFilter<"Patient"> | string
    birthDate?: DateTimeNullableWithAggregatesFilter<"Patient"> | Date | string | null
    age?: IntNullableWithAggregatesFilter<"Patient"> | number | null
    sex?: StringWithAggregatesFilter<"Patient"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Patient"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Patient"> | Date | string
  }

  export type EpisodeWhereInput = {
    AND?: EpisodeWhereInput | EpisodeWhereInput[]
    OR?: EpisodeWhereInput[]
    NOT?: EpisodeWhereInput | EpisodeWhereInput[]
    id?: StringFilter<"Episode"> | string
    patientId?: StringFilter<"Episode"> | string
    admissionDate?: DateTimeFilter<"Episode"> | Date | string
    admissionType?: StringFilter<"Episode"> | string
    chiefComplaint?: StringNullableFilter<"Episode"> | string | null
    status?: StringFilter<"Episode"> | string
    room?: StringNullableFilter<"Episode"> | string | null
    bed?: StringNullableFilter<"Episode"> | string | null
    attendingDoctor?: StringNullableFilter<"Episode"> | string | null
    createdAt?: DateTimeFilter<"Episode"> | Date | string
    updatedAt?: DateTimeFilter<"Episode"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    allergies?: AllergyListRelationFilter
    notes?: NoteListRelationFilter
    vitals?: VitalSignListRelationFilter
    handoffs?: HandoffListRelationFilter
  }

  export type EpisodeOrderByWithRelationInput = {
    id?: SortOrder
    patientId?: SortOrder
    admissionDate?: SortOrder
    admissionType?: SortOrder
    chiefComplaint?: SortOrderInput | SortOrder
    status?: SortOrder
    room?: SortOrderInput | SortOrder
    bed?: SortOrderInput | SortOrder
    attendingDoctor?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    patient?: PatientOrderByWithRelationInput
    allergies?: AllergyOrderByRelationAggregateInput
    notes?: NoteOrderByRelationAggregateInput
    vitals?: VitalSignOrderByRelationAggregateInput
    handoffs?: HandoffOrderByRelationAggregateInput
  }

  export type EpisodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EpisodeWhereInput | EpisodeWhereInput[]
    OR?: EpisodeWhereInput[]
    NOT?: EpisodeWhereInput | EpisodeWhereInput[]
    patientId?: StringFilter<"Episode"> | string
    admissionDate?: DateTimeFilter<"Episode"> | Date | string
    admissionType?: StringFilter<"Episode"> | string
    chiefComplaint?: StringNullableFilter<"Episode"> | string | null
    status?: StringFilter<"Episode"> | string
    room?: StringNullableFilter<"Episode"> | string | null
    bed?: StringNullableFilter<"Episode"> | string | null
    attendingDoctor?: StringNullableFilter<"Episode"> | string | null
    createdAt?: DateTimeFilter<"Episode"> | Date | string
    updatedAt?: DateTimeFilter<"Episode"> | Date | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    allergies?: AllergyListRelationFilter
    notes?: NoteListRelationFilter
    vitals?: VitalSignListRelationFilter
    handoffs?: HandoffListRelationFilter
  }, "id">

  export type EpisodeOrderByWithAggregationInput = {
    id?: SortOrder
    patientId?: SortOrder
    admissionDate?: SortOrder
    admissionType?: SortOrder
    chiefComplaint?: SortOrderInput | SortOrder
    status?: SortOrder
    room?: SortOrderInput | SortOrder
    bed?: SortOrderInput | SortOrder
    attendingDoctor?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EpisodeCountOrderByAggregateInput
    _max?: EpisodeMaxOrderByAggregateInput
    _min?: EpisodeMinOrderByAggregateInput
  }

  export type EpisodeScalarWhereWithAggregatesInput = {
    AND?: EpisodeScalarWhereWithAggregatesInput | EpisodeScalarWhereWithAggregatesInput[]
    OR?: EpisodeScalarWhereWithAggregatesInput[]
    NOT?: EpisodeScalarWhereWithAggregatesInput | EpisodeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Episode"> | string
    patientId?: StringWithAggregatesFilter<"Episode"> | string
    admissionDate?: DateTimeWithAggregatesFilter<"Episode"> | Date | string
    admissionType?: StringWithAggregatesFilter<"Episode"> | string
    chiefComplaint?: StringNullableWithAggregatesFilter<"Episode"> | string | null
    status?: StringWithAggregatesFilter<"Episode"> | string
    room?: StringNullableWithAggregatesFilter<"Episode"> | string | null
    bed?: StringNullableWithAggregatesFilter<"Episode"> | string | null
    attendingDoctor?: StringNullableWithAggregatesFilter<"Episode"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Episode"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Episode"> | Date | string
  }

  export type AllergyWhereInput = {
    AND?: AllergyWhereInput | AllergyWhereInput[]
    OR?: AllergyWhereInput[]
    NOT?: AllergyWhereInput | AllergyWhereInput[]
    id?: StringFilter<"Allergy"> | string
    patientId?: StringFilter<"Allergy"> | string
    episodeId?: StringFilter<"Allergy"> | string
    allergen?: StringFilter<"Allergy"> | string
    type?: StringFilter<"Allergy"> | string
    reaction?: StringNullableFilter<"Allergy"> | string | null
    severity?: StringFilter<"Allergy"> | string
    status?: StringFilter<"Allergy"> | string
    createdAt?: DateTimeFilter<"Allergy"> | Date | string
    createdBy?: StringFilter<"Allergy"> | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    episode?: XOR<EpisodeScalarRelationFilter, EpisodeWhereInput>
  }

  export type AllergyOrderByWithRelationInput = {
    id?: SortOrder
    patientId?: SortOrder
    episodeId?: SortOrder
    allergen?: SortOrder
    type?: SortOrder
    reaction?: SortOrderInput | SortOrder
    severity?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    patient?: PatientOrderByWithRelationInput
    episode?: EpisodeOrderByWithRelationInput
  }

  export type AllergyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AllergyWhereInput | AllergyWhereInput[]
    OR?: AllergyWhereInput[]
    NOT?: AllergyWhereInput | AllergyWhereInput[]
    patientId?: StringFilter<"Allergy"> | string
    episodeId?: StringFilter<"Allergy"> | string
    allergen?: StringFilter<"Allergy"> | string
    type?: StringFilter<"Allergy"> | string
    reaction?: StringNullableFilter<"Allergy"> | string | null
    severity?: StringFilter<"Allergy"> | string
    status?: StringFilter<"Allergy"> | string
    createdAt?: DateTimeFilter<"Allergy"> | Date | string
    createdBy?: StringFilter<"Allergy"> | string
    patient?: XOR<PatientScalarRelationFilter, PatientWhereInput>
    episode?: XOR<EpisodeScalarRelationFilter, EpisodeWhereInput>
  }, "id">

  export type AllergyOrderByWithAggregationInput = {
    id?: SortOrder
    patientId?: SortOrder
    episodeId?: SortOrder
    allergen?: SortOrder
    type?: SortOrder
    reaction?: SortOrderInput | SortOrder
    severity?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    _count?: AllergyCountOrderByAggregateInput
    _max?: AllergyMaxOrderByAggregateInput
    _min?: AllergyMinOrderByAggregateInput
  }

  export type AllergyScalarWhereWithAggregatesInput = {
    AND?: AllergyScalarWhereWithAggregatesInput | AllergyScalarWhereWithAggregatesInput[]
    OR?: AllergyScalarWhereWithAggregatesInput[]
    NOT?: AllergyScalarWhereWithAggregatesInput | AllergyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Allergy"> | string
    patientId?: StringWithAggregatesFilter<"Allergy"> | string
    episodeId?: StringWithAggregatesFilter<"Allergy"> | string
    allergen?: StringWithAggregatesFilter<"Allergy"> | string
    type?: StringWithAggregatesFilter<"Allergy"> | string
    reaction?: StringNullableWithAggregatesFilter<"Allergy"> | string | null
    severity?: StringWithAggregatesFilter<"Allergy"> | string
    status?: StringWithAggregatesFilter<"Allergy"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Allergy"> | Date | string
    createdBy?: StringWithAggregatesFilter<"Allergy"> | string
  }

  export type NoteWhereInput = {
    AND?: NoteWhereInput | NoteWhereInput[]
    OR?: NoteWhereInput[]
    NOT?: NoteWhereInput | NoteWhereInput[]
    id?: StringFilter<"Note"> | string
    episodeId?: StringFilter<"Note"> | string
    subjective?: StringNullableFilter<"Note"> | string | null
    objective?: StringNullableFilter<"Note"> | string | null
    assessment?: StringNullableFilter<"Note"> | string | null
    plan?: StringNullableFilter<"Note"> | string | null
    status?: StringFilter<"Note"> | string
    createdBy?: StringFilter<"Note"> | string
    createdAt?: DateTimeFilter<"Note"> | Date | string
    episode?: XOR<EpisodeScalarRelationFilter, EpisodeWhereInput>
  }

  export type NoteOrderByWithRelationInput = {
    id?: SortOrder
    episodeId?: SortOrder
    subjective?: SortOrderInput | SortOrder
    objective?: SortOrderInput | SortOrder
    assessment?: SortOrderInput | SortOrder
    plan?: SortOrderInput | SortOrder
    status?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    episode?: EpisodeOrderByWithRelationInput
  }

  export type NoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NoteWhereInput | NoteWhereInput[]
    OR?: NoteWhereInput[]
    NOT?: NoteWhereInput | NoteWhereInput[]
    episodeId?: StringFilter<"Note"> | string
    subjective?: StringNullableFilter<"Note"> | string | null
    objective?: StringNullableFilter<"Note"> | string | null
    assessment?: StringNullableFilter<"Note"> | string | null
    plan?: StringNullableFilter<"Note"> | string | null
    status?: StringFilter<"Note"> | string
    createdBy?: StringFilter<"Note"> | string
    createdAt?: DateTimeFilter<"Note"> | Date | string
    episode?: XOR<EpisodeScalarRelationFilter, EpisodeWhereInput>
  }, "id">

  export type NoteOrderByWithAggregationInput = {
    id?: SortOrder
    episodeId?: SortOrder
    subjective?: SortOrderInput | SortOrder
    objective?: SortOrderInput | SortOrder
    assessment?: SortOrderInput | SortOrder
    plan?: SortOrderInput | SortOrder
    status?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    _count?: NoteCountOrderByAggregateInput
    _max?: NoteMaxOrderByAggregateInput
    _min?: NoteMinOrderByAggregateInput
  }

  export type NoteScalarWhereWithAggregatesInput = {
    AND?: NoteScalarWhereWithAggregatesInput | NoteScalarWhereWithAggregatesInput[]
    OR?: NoteScalarWhereWithAggregatesInput[]
    NOT?: NoteScalarWhereWithAggregatesInput | NoteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Note"> | string
    episodeId?: StringWithAggregatesFilter<"Note"> | string
    subjective?: StringNullableWithAggregatesFilter<"Note"> | string | null
    objective?: StringNullableWithAggregatesFilter<"Note"> | string | null
    assessment?: StringNullableWithAggregatesFilter<"Note"> | string | null
    plan?: StringNullableWithAggregatesFilter<"Note"> | string | null
    status?: StringWithAggregatesFilter<"Note"> | string
    createdBy?: StringWithAggregatesFilter<"Note"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Note"> | Date | string
  }

  export type VitalSignWhereInput = {
    AND?: VitalSignWhereInput | VitalSignWhereInput[]
    OR?: VitalSignWhereInput[]
    NOT?: VitalSignWhereInput | VitalSignWhereInput[]
    id?: StringFilter<"VitalSign"> | string
    episodeId?: StringFilter<"VitalSign"> | string
    systolic?: IntNullableFilter<"VitalSign"> | number | null
    diastolic?: IntNullableFilter<"VitalSign"> | number | null
    heartRate?: IntNullableFilter<"VitalSign"> | number | null
    respiratoryRate?: IntNullableFilter<"VitalSign"> | number | null
    temperature?: FloatNullableFilter<"VitalSign"> | number | null
    oxygenSat?: IntNullableFilter<"VitalSign"> | number | null
    glucose?: IntNullableFilter<"VitalSign"> | number | null
    painScale?: IntNullableFilter<"VitalSign"> | number | null
    recordedBy?: StringFilter<"VitalSign"> | string
    createdAt?: DateTimeFilter<"VitalSign"> | Date | string
    episode?: XOR<EpisodeScalarRelationFilter, EpisodeWhereInput>
  }

  export type VitalSignOrderByWithRelationInput = {
    id?: SortOrder
    episodeId?: SortOrder
    systolic?: SortOrderInput | SortOrder
    diastolic?: SortOrderInput | SortOrder
    heartRate?: SortOrderInput | SortOrder
    respiratoryRate?: SortOrderInput | SortOrder
    temperature?: SortOrderInput | SortOrder
    oxygenSat?: SortOrderInput | SortOrder
    glucose?: SortOrderInput | SortOrder
    painScale?: SortOrderInput | SortOrder
    recordedBy?: SortOrder
    createdAt?: SortOrder
    episode?: EpisodeOrderByWithRelationInput
  }

  export type VitalSignWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VitalSignWhereInput | VitalSignWhereInput[]
    OR?: VitalSignWhereInput[]
    NOT?: VitalSignWhereInput | VitalSignWhereInput[]
    episodeId?: StringFilter<"VitalSign"> | string
    systolic?: IntNullableFilter<"VitalSign"> | number | null
    diastolic?: IntNullableFilter<"VitalSign"> | number | null
    heartRate?: IntNullableFilter<"VitalSign"> | number | null
    respiratoryRate?: IntNullableFilter<"VitalSign"> | number | null
    temperature?: FloatNullableFilter<"VitalSign"> | number | null
    oxygenSat?: IntNullableFilter<"VitalSign"> | number | null
    glucose?: IntNullableFilter<"VitalSign"> | number | null
    painScale?: IntNullableFilter<"VitalSign"> | number | null
    recordedBy?: StringFilter<"VitalSign"> | string
    createdAt?: DateTimeFilter<"VitalSign"> | Date | string
    episode?: XOR<EpisodeScalarRelationFilter, EpisodeWhereInput>
  }, "id">

  export type VitalSignOrderByWithAggregationInput = {
    id?: SortOrder
    episodeId?: SortOrder
    systolic?: SortOrderInput | SortOrder
    diastolic?: SortOrderInput | SortOrder
    heartRate?: SortOrderInput | SortOrder
    respiratoryRate?: SortOrderInput | SortOrder
    temperature?: SortOrderInput | SortOrder
    oxygenSat?: SortOrderInput | SortOrder
    glucose?: SortOrderInput | SortOrder
    painScale?: SortOrderInput | SortOrder
    recordedBy?: SortOrder
    createdAt?: SortOrder
    _count?: VitalSignCountOrderByAggregateInput
    _avg?: VitalSignAvgOrderByAggregateInput
    _max?: VitalSignMaxOrderByAggregateInput
    _min?: VitalSignMinOrderByAggregateInput
    _sum?: VitalSignSumOrderByAggregateInput
  }

  export type VitalSignScalarWhereWithAggregatesInput = {
    AND?: VitalSignScalarWhereWithAggregatesInput | VitalSignScalarWhereWithAggregatesInput[]
    OR?: VitalSignScalarWhereWithAggregatesInput[]
    NOT?: VitalSignScalarWhereWithAggregatesInput | VitalSignScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"VitalSign"> | string
    episodeId?: StringWithAggregatesFilter<"VitalSign"> | string
    systolic?: IntNullableWithAggregatesFilter<"VitalSign"> | number | null
    diastolic?: IntNullableWithAggregatesFilter<"VitalSign"> | number | null
    heartRate?: IntNullableWithAggregatesFilter<"VitalSign"> | number | null
    respiratoryRate?: IntNullableWithAggregatesFilter<"VitalSign"> | number | null
    temperature?: FloatNullableWithAggregatesFilter<"VitalSign"> | number | null
    oxygenSat?: IntNullableWithAggregatesFilter<"VitalSign"> | number | null
    glucose?: IntNullableWithAggregatesFilter<"VitalSign"> | number | null
    painScale?: IntNullableWithAggregatesFilter<"VitalSign"> | number | null
    recordedBy?: StringWithAggregatesFilter<"VitalSign"> | string
    createdAt?: DateTimeWithAggregatesFilter<"VitalSign"> | Date | string
  }

  export type HandoffWhereInput = {
    AND?: HandoffWhereInput | HandoffWhereInput[]
    OR?: HandoffWhereInput[]
    NOT?: HandoffWhereInput | HandoffWhereInput[]
    id?: StringFilter<"Handoff"> | string
    episodeId?: StringFilter<"Handoff"> | string
    entregadoPor?: StringFilter<"Handoff"> | string
    recibidoPor?: StringFilter<"Handoff"> | string
    observaciones?: StringNullableFilter<"Handoff"> | string | null
    status?: EnumHandoffStatusFilter<"Handoff"> | $Enums.HandoffStatus
    createdAt?: DateTimeFilter<"Handoff"> | Date | string
    aceptadoAt?: DateTimeNullableFilter<"Handoff"> | Date | string | null
    episode?: XOR<EpisodeScalarRelationFilter, EpisodeWhereInput>
  }

  export type HandoffOrderByWithRelationInput = {
    id?: SortOrder
    episodeId?: SortOrder
    entregadoPor?: SortOrder
    recibidoPor?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    aceptadoAt?: SortOrderInput | SortOrder
    episode?: EpisodeOrderByWithRelationInput
  }

  export type HandoffWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: HandoffWhereInput | HandoffWhereInput[]
    OR?: HandoffWhereInput[]
    NOT?: HandoffWhereInput | HandoffWhereInput[]
    episodeId?: StringFilter<"Handoff"> | string
    entregadoPor?: StringFilter<"Handoff"> | string
    recibidoPor?: StringFilter<"Handoff"> | string
    observaciones?: StringNullableFilter<"Handoff"> | string | null
    status?: EnumHandoffStatusFilter<"Handoff"> | $Enums.HandoffStatus
    createdAt?: DateTimeFilter<"Handoff"> | Date | string
    aceptadoAt?: DateTimeNullableFilter<"Handoff"> | Date | string | null
    episode?: XOR<EpisodeScalarRelationFilter, EpisodeWhereInput>
  }, "id">

  export type HandoffOrderByWithAggregationInput = {
    id?: SortOrder
    episodeId?: SortOrder
    entregadoPor?: SortOrder
    recibidoPor?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    aceptadoAt?: SortOrderInput | SortOrder
    _count?: HandoffCountOrderByAggregateInput
    _max?: HandoffMaxOrderByAggregateInput
    _min?: HandoffMinOrderByAggregateInput
  }

  export type HandoffScalarWhereWithAggregatesInput = {
    AND?: HandoffScalarWhereWithAggregatesInput | HandoffScalarWhereWithAggregatesInput[]
    OR?: HandoffScalarWhereWithAggregatesInput[]
    NOT?: HandoffScalarWhereWithAggregatesInput | HandoffScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Handoff"> | string
    episodeId?: StringWithAggregatesFilter<"Handoff"> | string
    entregadoPor?: StringWithAggregatesFilter<"Handoff"> | string
    recibidoPor?: StringWithAggregatesFilter<"Handoff"> | string
    observaciones?: StringNullableWithAggregatesFilter<"Handoff"> | string | null
    status?: EnumHandoffStatusWithAggregatesFilter<"Handoff"> | $Enums.HandoffStatus
    createdAt?: DateTimeWithAggregatesFilter<"Handoff"> | Date | string
    aceptadoAt?: DateTimeNullableWithAggregatesFilter<"Handoff"> | Date | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    passwordHash: string
    fullName: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    auditEntries?: AuditLogCreateNestedManyWithoutActorInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    fullName: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    auditEntries?: AuditLogUncheckedCreateNestedManyWithoutActorInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    auditEntries?: AuditLogUpdateManyWithoutActorNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    auditEntries?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    fullName: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: bigint | number
    seq: bigint | number
    prevHash: string
    entryHash: string
    actorRole: string
    patientId?: string | null
    episodeId?: string | null
    action: string
    entity: string
    entityId?: string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    serverTs?: Date | string
    actor: UserCreateNestedOneWithoutAuditEntriesInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: bigint | number
    seq: bigint | number
    prevHash: string
    entryHash: string
    actorId: string
    actorRole: string
    patientId?: string | null
    episodeId?: string | null
    action: string
    entity: string
    entityId?: string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    serverTs?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    seq?: BigIntFieldUpdateOperationsInput | bigint | number
    prevHash?: StringFieldUpdateOperationsInput | string
    entryHash?: StringFieldUpdateOperationsInput | string
    actorRole?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    episodeId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    serverTs?: DateTimeFieldUpdateOperationsInput | Date | string
    actor?: UserUpdateOneRequiredWithoutAuditEntriesNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    seq?: BigIntFieldUpdateOperationsInput | bigint | number
    prevHash?: StringFieldUpdateOperationsInput | string
    entryHash?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    actorRole?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    episodeId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    serverTs?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: bigint | number
    seq: bigint | number
    prevHash: string
    entryHash: string
    actorId: string
    actorRole: string
    patientId?: string | null
    episodeId?: string | null
    action: string
    entity: string
    entityId?: string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    serverTs?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    seq?: BigIntFieldUpdateOperationsInput | bigint | number
    prevHash?: StringFieldUpdateOperationsInput | string
    entryHash?: StringFieldUpdateOperationsInput | string
    actorRole?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    episodeId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    serverTs?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    seq?: BigIntFieldUpdateOperationsInput | bigint | number
    prevHash?: StringFieldUpdateOperationsInput | string
    entryHash?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    actorRole?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    episodeId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    serverTs?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientCreateInput = {
    id?: string
    expedienteNumber: string
    firstName: string
    lastName: string
    birthDate?: Date | string | null
    age?: number | null
    sex: string
    createdAt?: Date | string
    updatedAt?: Date | string
    episodes?: EpisodeCreateNestedManyWithoutPatientInput
    allergies?: AllergyCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateInput = {
    id?: string
    expedienteNumber: string
    firstName: string
    lastName: string
    birthDate?: Date | string | null
    age?: number | null
    sex: string
    createdAt?: Date | string
    updatedAt?: Date | string
    episodes?: EpisodeUncheckedCreateNestedManyWithoutPatientInput
    allergies?: AllergyUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    expedienteNumber?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    sex?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    episodes?: EpisodeUpdateManyWithoutPatientNestedInput
    allergies?: AllergyUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    expedienteNumber?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    sex?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    episodes?: EpisodeUncheckedUpdateManyWithoutPatientNestedInput
    allergies?: AllergyUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type PatientCreateManyInput = {
    id?: string
    expedienteNumber: string
    firstName: string
    lastName: string
    birthDate?: Date | string | null
    age?: number | null
    sex: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PatientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    expedienteNumber?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    sex?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    expedienteNumber?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    sex?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpisodeCreateInput = {
    id?: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutEpisodesInput
    allergies?: AllergyCreateNestedManyWithoutEpisodeInput
    notes?: NoteCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeUncheckedCreateInput = {
    id?: string
    patientId: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    allergies?: AllergyUncheckedCreateNestedManyWithoutEpisodeInput
    notes?: NoteUncheckedCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignUncheckedCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffUncheckedCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutEpisodesNestedInput
    allergies?: AllergyUpdateManyWithoutEpisodeNestedInput
    notes?: NoteUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allergies?: AllergyUncheckedUpdateManyWithoutEpisodeNestedInput
    notes?: NoteUncheckedUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUncheckedUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUncheckedUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeCreateManyInput = {
    id?: string
    patientId: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EpisodeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpisodeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AllergyCreateInput = {
    id?: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
    patient: PatientCreateNestedOneWithoutAllergiesInput
    episode: EpisodeCreateNestedOneWithoutAllergiesInput
  }

  export type AllergyUncheckedCreateInput = {
    id?: string
    patientId: string
    episodeId: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
  }

  export type AllergyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    patient?: PatientUpdateOneRequiredWithoutAllergiesNestedInput
    episode?: EpisodeUpdateOneRequiredWithoutAllergiesNestedInput
  }

  export type AllergyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type AllergyCreateManyInput = {
    id?: string
    patientId: string
    episodeId: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
  }

  export type AllergyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type AllergyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type NoteCreateInput = {
    id?: string
    subjective?: string | null
    objective?: string | null
    assessment?: string | null
    plan?: string | null
    status?: string
    createdBy: string
    createdAt?: Date | string
    episode: EpisodeCreateNestedOneWithoutNotesInput
  }

  export type NoteUncheckedCreateInput = {
    id?: string
    episodeId: string
    subjective?: string | null
    objective?: string | null
    assessment?: string | null
    plan?: string | null
    status?: string
    createdBy: string
    createdAt?: Date | string
  }

  export type NoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    subjective?: NullableStringFieldUpdateOperationsInput | string | null
    objective?: NullableStringFieldUpdateOperationsInput | string | null
    assessment?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    episode?: EpisodeUpdateOneRequiredWithoutNotesNestedInput
  }

  export type NoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    subjective?: NullableStringFieldUpdateOperationsInput | string | null
    objective?: NullableStringFieldUpdateOperationsInput | string | null
    assessment?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NoteCreateManyInput = {
    id?: string
    episodeId: string
    subjective?: string | null
    objective?: string | null
    assessment?: string | null
    plan?: string | null
    status?: string
    createdBy: string
    createdAt?: Date | string
  }

  export type NoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    subjective?: NullableStringFieldUpdateOperationsInput | string | null
    objective?: NullableStringFieldUpdateOperationsInput | string | null
    assessment?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    subjective?: NullableStringFieldUpdateOperationsInput | string | null
    objective?: NullableStringFieldUpdateOperationsInput | string | null
    assessment?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VitalSignCreateInput = {
    id?: string
    systolic?: number | null
    diastolic?: number | null
    heartRate?: number | null
    respiratoryRate?: number | null
    temperature?: number | null
    oxygenSat?: number | null
    glucose?: number | null
    painScale?: number | null
    recordedBy: string
    createdAt?: Date | string
    episode: EpisodeCreateNestedOneWithoutVitalsInput
  }

  export type VitalSignUncheckedCreateInput = {
    id?: string
    episodeId: string
    systolic?: number | null
    diastolic?: number | null
    heartRate?: number | null
    respiratoryRate?: number | null
    temperature?: number | null
    oxygenSat?: number | null
    glucose?: number | null
    painScale?: number | null
    recordedBy: string
    createdAt?: Date | string
  }

  export type VitalSignUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    systolic?: NullableIntFieldUpdateOperationsInput | number | null
    diastolic?: NullableIntFieldUpdateOperationsInput | number | null
    heartRate?: NullableIntFieldUpdateOperationsInput | number | null
    respiratoryRate?: NullableIntFieldUpdateOperationsInput | number | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    oxygenSat?: NullableIntFieldUpdateOperationsInput | number | null
    glucose?: NullableIntFieldUpdateOperationsInput | number | null
    painScale?: NullableIntFieldUpdateOperationsInput | number | null
    recordedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    episode?: EpisodeUpdateOneRequiredWithoutVitalsNestedInput
  }

  export type VitalSignUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    systolic?: NullableIntFieldUpdateOperationsInput | number | null
    diastolic?: NullableIntFieldUpdateOperationsInput | number | null
    heartRate?: NullableIntFieldUpdateOperationsInput | number | null
    respiratoryRate?: NullableIntFieldUpdateOperationsInput | number | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    oxygenSat?: NullableIntFieldUpdateOperationsInput | number | null
    glucose?: NullableIntFieldUpdateOperationsInput | number | null
    painScale?: NullableIntFieldUpdateOperationsInput | number | null
    recordedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VitalSignCreateManyInput = {
    id?: string
    episodeId: string
    systolic?: number | null
    diastolic?: number | null
    heartRate?: number | null
    respiratoryRate?: number | null
    temperature?: number | null
    oxygenSat?: number | null
    glucose?: number | null
    painScale?: number | null
    recordedBy: string
    createdAt?: Date | string
  }

  export type VitalSignUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    systolic?: NullableIntFieldUpdateOperationsInput | number | null
    diastolic?: NullableIntFieldUpdateOperationsInput | number | null
    heartRate?: NullableIntFieldUpdateOperationsInput | number | null
    respiratoryRate?: NullableIntFieldUpdateOperationsInput | number | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    oxygenSat?: NullableIntFieldUpdateOperationsInput | number | null
    glucose?: NullableIntFieldUpdateOperationsInput | number | null
    painScale?: NullableIntFieldUpdateOperationsInput | number | null
    recordedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VitalSignUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    systolic?: NullableIntFieldUpdateOperationsInput | number | null
    diastolic?: NullableIntFieldUpdateOperationsInput | number | null
    heartRate?: NullableIntFieldUpdateOperationsInput | number | null
    respiratoryRate?: NullableIntFieldUpdateOperationsInput | number | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    oxygenSat?: NullableIntFieldUpdateOperationsInput | number | null
    glucose?: NullableIntFieldUpdateOperationsInput | number | null
    painScale?: NullableIntFieldUpdateOperationsInput | number | null
    recordedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HandoffCreateInput = {
    id?: string
    entregadoPor: string
    recibidoPor: string
    observaciones?: string | null
    status?: $Enums.HandoffStatus
    createdAt?: Date | string
    aceptadoAt?: Date | string | null
    episode: EpisodeCreateNestedOneWithoutHandoffsInput
  }

  export type HandoffUncheckedCreateInput = {
    id?: string
    episodeId: string
    entregadoPor: string
    recibidoPor: string
    observaciones?: string | null
    status?: $Enums.HandoffStatus
    createdAt?: Date | string
    aceptadoAt?: Date | string | null
  }

  export type HandoffUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entregadoPor?: StringFieldUpdateOperationsInput | string
    recibidoPor?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumHandoffStatusFieldUpdateOperationsInput | $Enums.HandoffStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aceptadoAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    episode?: EpisodeUpdateOneRequiredWithoutHandoffsNestedInput
  }

  export type HandoffUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    entregadoPor?: StringFieldUpdateOperationsInput | string
    recibidoPor?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumHandoffStatusFieldUpdateOperationsInput | $Enums.HandoffStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aceptadoAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HandoffCreateManyInput = {
    id?: string
    episodeId: string
    entregadoPor: string
    recibidoPor: string
    observaciones?: string | null
    status?: $Enums.HandoffStatus
    createdAt?: Date | string
    aceptadoAt?: Date | string | null
  }

  export type HandoffUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entregadoPor?: StringFieldUpdateOperationsInput | string
    recibidoPor?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumHandoffStatusFieldUpdateOperationsInput | $Enums.HandoffStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aceptadoAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HandoffUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    entregadoPor?: StringFieldUpdateOperationsInput | string
    recibidoPor?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumHandoffStatusFieldUpdateOperationsInput | $Enums.HandoffStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aceptadoAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    fullName?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    fullName?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    fullName?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    seq?: SortOrder
    prevHash?: SortOrder
    entryHash?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    patientId?: SortOrder
    episodeId?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    oldValue?: SortOrder
    newValue?: SortOrder
    reason?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    serverTs?: SortOrder
  }

  export type AuditLogAvgOrderByAggregateInput = {
    id?: SortOrder
    seq?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    seq?: SortOrder
    prevHash?: SortOrder
    entryHash?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    patientId?: SortOrder
    episodeId?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    reason?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    serverTs?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    seq?: SortOrder
    prevHash?: SortOrder
    entryHash?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    patientId?: SortOrder
    episodeId?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    reason?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    serverTs?: SortOrder
  }

  export type AuditLogSumOrderByAggregateInput = {
    id?: SortOrder
    seq?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EpisodeListRelationFilter = {
    every?: EpisodeWhereInput
    some?: EpisodeWhereInput
    none?: EpisodeWhereInput
  }

  export type AllergyListRelationFilter = {
    every?: AllergyWhereInput
    some?: AllergyWhereInput
    none?: AllergyWhereInput
  }

  export type EpisodeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AllergyOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PatientCountOrderByAggregateInput = {
    id?: SortOrder
    expedienteNumber?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    birthDate?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientAvgOrderByAggregateInput = {
    age?: SortOrder
  }

  export type PatientMaxOrderByAggregateInput = {
    id?: SortOrder
    expedienteNumber?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    birthDate?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientMinOrderByAggregateInput = {
    id?: SortOrder
    expedienteNumber?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    birthDate?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientSumOrderByAggregateInput = {
    age?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type PatientScalarRelationFilter = {
    is?: PatientWhereInput
    isNot?: PatientWhereInput
  }

  export type NoteListRelationFilter = {
    every?: NoteWhereInput
    some?: NoteWhereInput
    none?: NoteWhereInput
  }

  export type VitalSignListRelationFilter = {
    every?: VitalSignWhereInput
    some?: VitalSignWhereInput
    none?: VitalSignWhereInput
  }

  export type HandoffListRelationFilter = {
    every?: HandoffWhereInput
    some?: HandoffWhereInput
    none?: HandoffWhereInput
  }

  export type NoteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VitalSignOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type HandoffOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EpisodeCountOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    admissionDate?: SortOrder
    admissionType?: SortOrder
    chiefComplaint?: SortOrder
    status?: SortOrder
    room?: SortOrder
    bed?: SortOrder
    attendingDoctor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EpisodeMaxOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    admissionDate?: SortOrder
    admissionType?: SortOrder
    chiefComplaint?: SortOrder
    status?: SortOrder
    room?: SortOrder
    bed?: SortOrder
    attendingDoctor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EpisodeMinOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    admissionDate?: SortOrder
    admissionType?: SortOrder
    chiefComplaint?: SortOrder
    status?: SortOrder
    room?: SortOrder
    bed?: SortOrder
    attendingDoctor?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EpisodeScalarRelationFilter = {
    is?: EpisodeWhereInput
    isNot?: EpisodeWhereInput
  }

  export type AllergyCountOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    episodeId?: SortOrder
    allergen?: SortOrder
    type?: SortOrder
    reaction?: SortOrder
    severity?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type AllergyMaxOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    episodeId?: SortOrder
    allergen?: SortOrder
    type?: SortOrder
    reaction?: SortOrder
    severity?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type AllergyMinOrderByAggregateInput = {
    id?: SortOrder
    patientId?: SortOrder
    episodeId?: SortOrder
    allergen?: SortOrder
    type?: SortOrder
    reaction?: SortOrder
    severity?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type NoteCountOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    subjective?: SortOrder
    objective?: SortOrder
    assessment?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
  }

  export type NoteMaxOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    subjective?: SortOrder
    objective?: SortOrder
    assessment?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
  }

  export type NoteMinOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    subjective?: SortOrder
    objective?: SortOrder
    assessment?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type VitalSignCountOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    systolic?: SortOrder
    diastolic?: SortOrder
    heartRate?: SortOrder
    respiratoryRate?: SortOrder
    temperature?: SortOrder
    oxygenSat?: SortOrder
    glucose?: SortOrder
    painScale?: SortOrder
    recordedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type VitalSignAvgOrderByAggregateInput = {
    systolic?: SortOrder
    diastolic?: SortOrder
    heartRate?: SortOrder
    respiratoryRate?: SortOrder
    temperature?: SortOrder
    oxygenSat?: SortOrder
    glucose?: SortOrder
    painScale?: SortOrder
  }

  export type VitalSignMaxOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    systolic?: SortOrder
    diastolic?: SortOrder
    heartRate?: SortOrder
    respiratoryRate?: SortOrder
    temperature?: SortOrder
    oxygenSat?: SortOrder
    glucose?: SortOrder
    painScale?: SortOrder
    recordedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type VitalSignMinOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    systolic?: SortOrder
    diastolic?: SortOrder
    heartRate?: SortOrder
    respiratoryRate?: SortOrder
    temperature?: SortOrder
    oxygenSat?: SortOrder
    glucose?: SortOrder
    painScale?: SortOrder
    recordedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type VitalSignSumOrderByAggregateInput = {
    systolic?: SortOrder
    diastolic?: SortOrder
    heartRate?: SortOrder
    respiratoryRate?: SortOrder
    temperature?: SortOrder
    oxygenSat?: SortOrder
    glucose?: SortOrder
    painScale?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumHandoffStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.HandoffStatus | EnumHandoffStatusFieldRefInput<$PrismaModel>
    in?: $Enums.HandoffStatus[] | ListEnumHandoffStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.HandoffStatus[] | ListEnumHandoffStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumHandoffStatusFilter<$PrismaModel> | $Enums.HandoffStatus
  }

  export type HandoffCountOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    entregadoPor?: SortOrder
    recibidoPor?: SortOrder
    observaciones?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    aceptadoAt?: SortOrder
  }

  export type HandoffMaxOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    entregadoPor?: SortOrder
    recibidoPor?: SortOrder
    observaciones?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    aceptadoAt?: SortOrder
  }

  export type HandoffMinOrderByAggregateInput = {
    id?: SortOrder
    episodeId?: SortOrder
    entregadoPor?: SortOrder
    recibidoPor?: SortOrder
    observaciones?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    aceptadoAt?: SortOrder
  }

  export type EnumHandoffStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HandoffStatus | EnumHandoffStatusFieldRefInput<$PrismaModel>
    in?: $Enums.HandoffStatus[] | ListEnumHandoffStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.HandoffStatus[] | ListEnumHandoffStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumHandoffStatusWithAggregatesFilter<$PrismaModel> | $Enums.HandoffStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumHandoffStatusFilter<$PrismaModel>
    _max?: NestedEnumHandoffStatusFilter<$PrismaModel>
  }

  export type AuditLogCreateNestedManyWithoutActorInput = {
    create?: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput> | AuditLogCreateWithoutActorInput[] | AuditLogUncheckedCreateWithoutActorInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutActorInput | AuditLogCreateOrConnectWithoutActorInput[]
    createMany?: AuditLogCreateManyActorInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type AuditLogUncheckedCreateNestedManyWithoutActorInput = {
    create?: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput> | AuditLogCreateWithoutActorInput[] | AuditLogUncheckedCreateWithoutActorInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutActorInput | AuditLogCreateOrConnectWithoutActorInput[]
    createMany?: AuditLogCreateManyActorInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AuditLogUpdateManyWithoutActorNestedInput = {
    create?: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput> | AuditLogCreateWithoutActorInput[] | AuditLogUncheckedCreateWithoutActorInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutActorInput | AuditLogCreateOrConnectWithoutActorInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutActorInput | AuditLogUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: AuditLogCreateManyActorInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutActorInput | AuditLogUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutActorInput | AuditLogUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type AuditLogUncheckedUpdateManyWithoutActorNestedInput = {
    create?: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput> | AuditLogCreateWithoutActorInput[] | AuditLogUncheckedCreateWithoutActorInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutActorInput | AuditLogCreateOrConnectWithoutActorInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutActorInput | AuditLogUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: AuditLogCreateManyActorInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutActorInput | AuditLogUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutActorInput | AuditLogUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutAuditEntriesInput = {
    create?: XOR<UserCreateWithoutAuditEntriesInput, UserUncheckedCreateWithoutAuditEntriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuditEntriesInput
    connect?: UserWhereUniqueInput
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UserUpdateOneRequiredWithoutAuditEntriesNestedInput = {
    create?: XOR<UserCreateWithoutAuditEntriesInput, UserUncheckedCreateWithoutAuditEntriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuditEntriesInput
    upsert?: UserUpsertWithoutAuditEntriesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAuditEntriesInput, UserUpdateWithoutAuditEntriesInput>, UserUncheckedUpdateWithoutAuditEntriesInput>
  }

  export type EpisodeCreateNestedManyWithoutPatientInput = {
    create?: XOR<EpisodeCreateWithoutPatientInput, EpisodeUncheckedCreateWithoutPatientInput> | EpisodeCreateWithoutPatientInput[] | EpisodeUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: EpisodeCreateOrConnectWithoutPatientInput | EpisodeCreateOrConnectWithoutPatientInput[]
    createMany?: EpisodeCreateManyPatientInputEnvelope
    connect?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
  }

  export type AllergyCreateNestedManyWithoutPatientInput = {
    create?: XOR<AllergyCreateWithoutPatientInput, AllergyUncheckedCreateWithoutPatientInput> | AllergyCreateWithoutPatientInput[] | AllergyUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AllergyCreateOrConnectWithoutPatientInput | AllergyCreateOrConnectWithoutPatientInput[]
    createMany?: AllergyCreateManyPatientInputEnvelope
    connect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
  }

  export type EpisodeUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<EpisodeCreateWithoutPatientInput, EpisodeUncheckedCreateWithoutPatientInput> | EpisodeCreateWithoutPatientInput[] | EpisodeUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: EpisodeCreateOrConnectWithoutPatientInput | EpisodeCreateOrConnectWithoutPatientInput[]
    createMany?: EpisodeCreateManyPatientInputEnvelope
    connect?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
  }

  export type AllergyUncheckedCreateNestedManyWithoutPatientInput = {
    create?: XOR<AllergyCreateWithoutPatientInput, AllergyUncheckedCreateWithoutPatientInput> | AllergyCreateWithoutPatientInput[] | AllergyUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AllergyCreateOrConnectWithoutPatientInput | AllergyCreateOrConnectWithoutPatientInput[]
    createMany?: AllergyCreateManyPatientInputEnvelope
    connect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EpisodeUpdateManyWithoutPatientNestedInput = {
    create?: XOR<EpisodeCreateWithoutPatientInput, EpisodeUncheckedCreateWithoutPatientInput> | EpisodeCreateWithoutPatientInput[] | EpisodeUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: EpisodeCreateOrConnectWithoutPatientInput | EpisodeCreateOrConnectWithoutPatientInput[]
    upsert?: EpisodeUpsertWithWhereUniqueWithoutPatientInput | EpisodeUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: EpisodeCreateManyPatientInputEnvelope
    set?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
    disconnect?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
    delete?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
    connect?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
    update?: EpisodeUpdateWithWhereUniqueWithoutPatientInput | EpisodeUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: EpisodeUpdateManyWithWhereWithoutPatientInput | EpisodeUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: EpisodeScalarWhereInput | EpisodeScalarWhereInput[]
  }

  export type AllergyUpdateManyWithoutPatientNestedInput = {
    create?: XOR<AllergyCreateWithoutPatientInput, AllergyUncheckedCreateWithoutPatientInput> | AllergyCreateWithoutPatientInput[] | AllergyUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AllergyCreateOrConnectWithoutPatientInput | AllergyCreateOrConnectWithoutPatientInput[]
    upsert?: AllergyUpsertWithWhereUniqueWithoutPatientInput | AllergyUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: AllergyCreateManyPatientInputEnvelope
    set?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    disconnect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    delete?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    connect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    update?: AllergyUpdateWithWhereUniqueWithoutPatientInput | AllergyUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: AllergyUpdateManyWithWhereWithoutPatientInput | AllergyUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: AllergyScalarWhereInput | AllergyScalarWhereInput[]
  }

  export type EpisodeUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<EpisodeCreateWithoutPatientInput, EpisodeUncheckedCreateWithoutPatientInput> | EpisodeCreateWithoutPatientInput[] | EpisodeUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: EpisodeCreateOrConnectWithoutPatientInput | EpisodeCreateOrConnectWithoutPatientInput[]
    upsert?: EpisodeUpsertWithWhereUniqueWithoutPatientInput | EpisodeUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: EpisodeCreateManyPatientInputEnvelope
    set?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
    disconnect?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
    delete?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
    connect?: EpisodeWhereUniqueInput | EpisodeWhereUniqueInput[]
    update?: EpisodeUpdateWithWhereUniqueWithoutPatientInput | EpisodeUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: EpisodeUpdateManyWithWhereWithoutPatientInput | EpisodeUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: EpisodeScalarWhereInput | EpisodeScalarWhereInput[]
  }

  export type AllergyUncheckedUpdateManyWithoutPatientNestedInput = {
    create?: XOR<AllergyCreateWithoutPatientInput, AllergyUncheckedCreateWithoutPatientInput> | AllergyCreateWithoutPatientInput[] | AllergyUncheckedCreateWithoutPatientInput[]
    connectOrCreate?: AllergyCreateOrConnectWithoutPatientInput | AllergyCreateOrConnectWithoutPatientInput[]
    upsert?: AllergyUpsertWithWhereUniqueWithoutPatientInput | AllergyUpsertWithWhereUniqueWithoutPatientInput[]
    createMany?: AllergyCreateManyPatientInputEnvelope
    set?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    disconnect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    delete?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    connect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    update?: AllergyUpdateWithWhereUniqueWithoutPatientInput | AllergyUpdateWithWhereUniqueWithoutPatientInput[]
    updateMany?: AllergyUpdateManyWithWhereWithoutPatientInput | AllergyUpdateManyWithWhereWithoutPatientInput[]
    deleteMany?: AllergyScalarWhereInput | AllergyScalarWhereInput[]
  }

  export type PatientCreateNestedOneWithoutEpisodesInput = {
    create?: XOR<PatientCreateWithoutEpisodesInput, PatientUncheckedCreateWithoutEpisodesInput>
    connectOrCreate?: PatientCreateOrConnectWithoutEpisodesInput
    connect?: PatientWhereUniqueInput
  }

  export type AllergyCreateNestedManyWithoutEpisodeInput = {
    create?: XOR<AllergyCreateWithoutEpisodeInput, AllergyUncheckedCreateWithoutEpisodeInput> | AllergyCreateWithoutEpisodeInput[] | AllergyUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: AllergyCreateOrConnectWithoutEpisodeInput | AllergyCreateOrConnectWithoutEpisodeInput[]
    createMany?: AllergyCreateManyEpisodeInputEnvelope
    connect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
  }

  export type NoteCreateNestedManyWithoutEpisodeInput = {
    create?: XOR<NoteCreateWithoutEpisodeInput, NoteUncheckedCreateWithoutEpisodeInput> | NoteCreateWithoutEpisodeInput[] | NoteUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: NoteCreateOrConnectWithoutEpisodeInput | NoteCreateOrConnectWithoutEpisodeInput[]
    createMany?: NoteCreateManyEpisodeInputEnvelope
    connect?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
  }

  export type VitalSignCreateNestedManyWithoutEpisodeInput = {
    create?: XOR<VitalSignCreateWithoutEpisodeInput, VitalSignUncheckedCreateWithoutEpisodeInput> | VitalSignCreateWithoutEpisodeInput[] | VitalSignUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: VitalSignCreateOrConnectWithoutEpisodeInput | VitalSignCreateOrConnectWithoutEpisodeInput[]
    createMany?: VitalSignCreateManyEpisodeInputEnvelope
    connect?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
  }

  export type HandoffCreateNestedManyWithoutEpisodeInput = {
    create?: XOR<HandoffCreateWithoutEpisodeInput, HandoffUncheckedCreateWithoutEpisodeInput> | HandoffCreateWithoutEpisodeInput[] | HandoffUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: HandoffCreateOrConnectWithoutEpisodeInput | HandoffCreateOrConnectWithoutEpisodeInput[]
    createMany?: HandoffCreateManyEpisodeInputEnvelope
    connect?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
  }

  export type AllergyUncheckedCreateNestedManyWithoutEpisodeInput = {
    create?: XOR<AllergyCreateWithoutEpisodeInput, AllergyUncheckedCreateWithoutEpisodeInput> | AllergyCreateWithoutEpisodeInput[] | AllergyUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: AllergyCreateOrConnectWithoutEpisodeInput | AllergyCreateOrConnectWithoutEpisodeInput[]
    createMany?: AllergyCreateManyEpisodeInputEnvelope
    connect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
  }

  export type NoteUncheckedCreateNestedManyWithoutEpisodeInput = {
    create?: XOR<NoteCreateWithoutEpisodeInput, NoteUncheckedCreateWithoutEpisodeInput> | NoteCreateWithoutEpisodeInput[] | NoteUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: NoteCreateOrConnectWithoutEpisodeInput | NoteCreateOrConnectWithoutEpisodeInput[]
    createMany?: NoteCreateManyEpisodeInputEnvelope
    connect?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
  }

  export type VitalSignUncheckedCreateNestedManyWithoutEpisodeInput = {
    create?: XOR<VitalSignCreateWithoutEpisodeInput, VitalSignUncheckedCreateWithoutEpisodeInput> | VitalSignCreateWithoutEpisodeInput[] | VitalSignUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: VitalSignCreateOrConnectWithoutEpisodeInput | VitalSignCreateOrConnectWithoutEpisodeInput[]
    createMany?: VitalSignCreateManyEpisodeInputEnvelope
    connect?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
  }

  export type HandoffUncheckedCreateNestedManyWithoutEpisodeInput = {
    create?: XOR<HandoffCreateWithoutEpisodeInput, HandoffUncheckedCreateWithoutEpisodeInput> | HandoffCreateWithoutEpisodeInput[] | HandoffUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: HandoffCreateOrConnectWithoutEpisodeInput | HandoffCreateOrConnectWithoutEpisodeInput[]
    createMany?: HandoffCreateManyEpisodeInputEnvelope
    connect?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
  }

  export type PatientUpdateOneRequiredWithoutEpisodesNestedInput = {
    create?: XOR<PatientCreateWithoutEpisodesInput, PatientUncheckedCreateWithoutEpisodesInput>
    connectOrCreate?: PatientCreateOrConnectWithoutEpisodesInput
    upsert?: PatientUpsertWithoutEpisodesInput
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutEpisodesInput, PatientUpdateWithoutEpisodesInput>, PatientUncheckedUpdateWithoutEpisodesInput>
  }

  export type AllergyUpdateManyWithoutEpisodeNestedInput = {
    create?: XOR<AllergyCreateWithoutEpisodeInput, AllergyUncheckedCreateWithoutEpisodeInput> | AllergyCreateWithoutEpisodeInput[] | AllergyUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: AllergyCreateOrConnectWithoutEpisodeInput | AllergyCreateOrConnectWithoutEpisodeInput[]
    upsert?: AllergyUpsertWithWhereUniqueWithoutEpisodeInput | AllergyUpsertWithWhereUniqueWithoutEpisodeInput[]
    createMany?: AllergyCreateManyEpisodeInputEnvelope
    set?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    disconnect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    delete?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    connect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    update?: AllergyUpdateWithWhereUniqueWithoutEpisodeInput | AllergyUpdateWithWhereUniqueWithoutEpisodeInput[]
    updateMany?: AllergyUpdateManyWithWhereWithoutEpisodeInput | AllergyUpdateManyWithWhereWithoutEpisodeInput[]
    deleteMany?: AllergyScalarWhereInput | AllergyScalarWhereInput[]
  }

  export type NoteUpdateManyWithoutEpisodeNestedInput = {
    create?: XOR<NoteCreateWithoutEpisodeInput, NoteUncheckedCreateWithoutEpisodeInput> | NoteCreateWithoutEpisodeInput[] | NoteUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: NoteCreateOrConnectWithoutEpisodeInput | NoteCreateOrConnectWithoutEpisodeInput[]
    upsert?: NoteUpsertWithWhereUniqueWithoutEpisodeInput | NoteUpsertWithWhereUniqueWithoutEpisodeInput[]
    createMany?: NoteCreateManyEpisodeInputEnvelope
    set?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
    disconnect?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
    delete?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
    connect?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
    update?: NoteUpdateWithWhereUniqueWithoutEpisodeInput | NoteUpdateWithWhereUniqueWithoutEpisodeInput[]
    updateMany?: NoteUpdateManyWithWhereWithoutEpisodeInput | NoteUpdateManyWithWhereWithoutEpisodeInput[]
    deleteMany?: NoteScalarWhereInput | NoteScalarWhereInput[]
  }

  export type VitalSignUpdateManyWithoutEpisodeNestedInput = {
    create?: XOR<VitalSignCreateWithoutEpisodeInput, VitalSignUncheckedCreateWithoutEpisodeInput> | VitalSignCreateWithoutEpisodeInput[] | VitalSignUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: VitalSignCreateOrConnectWithoutEpisodeInput | VitalSignCreateOrConnectWithoutEpisodeInput[]
    upsert?: VitalSignUpsertWithWhereUniqueWithoutEpisodeInput | VitalSignUpsertWithWhereUniqueWithoutEpisodeInput[]
    createMany?: VitalSignCreateManyEpisodeInputEnvelope
    set?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
    disconnect?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
    delete?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
    connect?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
    update?: VitalSignUpdateWithWhereUniqueWithoutEpisodeInput | VitalSignUpdateWithWhereUniqueWithoutEpisodeInput[]
    updateMany?: VitalSignUpdateManyWithWhereWithoutEpisodeInput | VitalSignUpdateManyWithWhereWithoutEpisodeInput[]
    deleteMany?: VitalSignScalarWhereInput | VitalSignScalarWhereInput[]
  }

  export type HandoffUpdateManyWithoutEpisodeNestedInput = {
    create?: XOR<HandoffCreateWithoutEpisodeInput, HandoffUncheckedCreateWithoutEpisodeInput> | HandoffCreateWithoutEpisodeInput[] | HandoffUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: HandoffCreateOrConnectWithoutEpisodeInput | HandoffCreateOrConnectWithoutEpisodeInput[]
    upsert?: HandoffUpsertWithWhereUniqueWithoutEpisodeInput | HandoffUpsertWithWhereUniqueWithoutEpisodeInput[]
    createMany?: HandoffCreateManyEpisodeInputEnvelope
    set?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
    disconnect?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
    delete?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
    connect?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
    update?: HandoffUpdateWithWhereUniqueWithoutEpisodeInput | HandoffUpdateWithWhereUniqueWithoutEpisodeInput[]
    updateMany?: HandoffUpdateManyWithWhereWithoutEpisodeInput | HandoffUpdateManyWithWhereWithoutEpisodeInput[]
    deleteMany?: HandoffScalarWhereInput | HandoffScalarWhereInput[]
  }

  export type AllergyUncheckedUpdateManyWithoutEpisodeNestedInput = {
    create?: XOR<AllergyCreateWithoutEpisodeInput, AllergyUncheckedCreateWithoutEpisodeInput> | AllergyCreateWithoutEpisodeInput[] | AllergyUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: AllergyCreateOrConnectWithoutEpisodeInput | AllergyCreateOrConnectWithoutEpisodeInput[]
    upsert?: AllergyUpsertWithWhereUniqueWithoutEpisodeInput | AllergyUpsertWithWhereUniqueWithoutEpisodeInput[]
    createMany?: AllergyCreateManyEpisodeInputEnvelope
    set?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    disconnect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    delete?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    connect?: AllergyWhereUniqueInput | AllergyWhereUniqueInput[]
    update?: AllergyUpdateWithWhereUniqueWithoutEpisodeInput | AllergyUpdateWithWhereUniqueWithoutEpisodeInput[]
    updateMany?: AllergyUpdateManyWithWhereWithoutEpisodeInput | AllergyUpdateManyWithWhereWithoutEpisodeInput[]
    deleteMany?: AllergyScalarWhereInput | AllergyScalarWhereInput[]
  }

  export type NoteUncheckedUpdateManyWithoutEpisodeNestedInput = {
    create?: XOR<NoteCreateWithoutEpisodeInput, NoteUncheckedCreateWithoutEpisodeInput> | NoteCreateWithoutEpisodeInput[] | NoteUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: NoteCreateOrConnectWithoutEpisodeInput | NoteCreateOrConnectWithoutEpisodeInput[]
    upsert?: NoteUpsertWithWhereUniqueWithoutEpisodeInput | NoteUpsertWithWhereUniqueWithoutEpisodeInput[]
    createMany?: NoteCreateManyEpisodeInputEnvelope
    set?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
    disconnect?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
    delete?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
    connect?: NoteWhereUniqueInput | NoteWhereUniqueInput[]
    update?: NoteUpdateWithWhereUniqueWithoutEpisodeInput | NoteUpdateWithWhereUniqueWithoutEpisodeInput[]
    updateMany?: NoteUpdateManyWithWhereWithoutEpisodeInput | NoteUpdateManyWithWhereWithoutEpisodeInput[]
    deleteMany?: NoteScalarWhereInput | NoteScalarWhereInput[]
  }

  export type VitalSignUncheckedUpdateManyWithoutEpisodeNestedInput = {
    create?: XOR<VitalSignCreateWithoutEpisodeInput, VitalSignUncheckedCreateWithoutEpisodeInput> | VitalSignCreateWithoutEpisodeInput[] | VitalSignUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: VitalSignCreateOrConnectWithoutEpisodeInput | VitalSignCreateOrConnectWithoutEpisodeInput[]
    upsert?: VitalSignUpsertWithWhereUniqueWithoutEpisodeInput | VitalSignUpsertWithWhereUniqueWithoutEpisodeInput[]
    createMany?: VitalSignCreateManyEpisodeInputEnvelope
    set?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
    disconnect?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
    delete?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
    connect?: VitalSignWhereUniqueInput | VitalSignWhereUniqueInput[]
    update?: VitalSignUpdateWithWhereUniqueWithoutEpisodeInput | VitalSignUpdateWithWhereUniqueWithoutEpisodeInput[]
    updateMany?: VitalSignUpdateManyWithWhereWithoutEpisodeInput | VitalSignUpdateManyWithWhereWithoutEpisodeInput[]
    deleteMany?: VitalSignScalarWhereInput | VitalSignScalarWhereInput[]
  }

  export type HandoffUncheckedUpdateManyWithoutEpisodeNestedInput = {
    create?: XOR<HandoffCreateWithoutEpisodeInput, HandoffUncheckedCreateWithoutEpisodeInput> | HandoffCreateWithoutEpisodeInput[] | HandoffUncheckedCreateWithoutEpisodeInput[]
    connectOrCreate?: HandoffCreateOrConnectWithoutEpisodeInput | HandoffCreateOrConnectWithoutEpisodeInput[]
    upsert?: HandoffUpsertWithWhereUniqueWithoutEpisodeInput | HandoffUpsertWithWhereUniqueWithoutEpisodeInput[]
    createMany?: HandoffCreateManyEpisodeInputEnvelope
    set?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
    disconnect?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
    delete?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
    connect?: HandoffWhereUniqueInput | HandoffWhereUniqueInput[]
    update?: HandoffUpdateWithWhereUniqueWithoutEpisodeInput | HandoffUpdateWithWhereUniqueWithoutEpisodeInput[]
    updateMany?: HandoffUpdateManyWithWhereWithoutEpisodeInput | HandoffUpdateManyWithWhereWithoutEpisodeInput[]
    deleteMany?: HandoffScalarWhereInput | HandoffScalarWhereInput[]
  }

  export type PatientCreateNestedOneWithoutAllergiesInput = {
    create?: XOR<PatientCreateWithoutAllergiesInput, PatientUncheckedCreateWithoutAllergiesInput>
    connectOrCreate?: PatientCreateOrConnectWithoutAllergiesInput
    connect?: PatientWhereUniqueInput
  }

  export type EpisodeCreateNestedOneWithoutAllergiesInput = {
    create?: XOR<EpisodeCreateWithoutAllergiesInput, EpisodeUncheckedCreateWithoutAllergiesInput>
    connectOrCreate?: EpisodeCreateOrConnectWithoutAllergiesInput
    connect?: EpisodeWhereUniqueInput
  }

  export type PatientUpdateOneRequiredWithoutAllergiesNestedInput = {
    create?: XOR<PatientCreateWithoutAllergiesInput, PatientUncheckedCreateWithoutAllergiesInput>
    connectOrCreate?: PatientCreateOrConnectWithoutAllergiesInput
    upsert?: PatientUpsertWithoutAllergiesInput
    connect?: PatientWhereUniqueInput
    update?: XOR<XOR<PatientUpdateToOneWithWhereWithoutAllergiesInput, PatientUpdateWithoutAllergiesInput>, PatientUncheckedUpdateWithoutAllergiesInput>
  }

  export type EpisodeUpdateOneRequiredWithoutAllergiesNestedInput = {
    create?: XOR<EpisodeCreateWithoutAllergiesInput, EpisodeUncheckedCreateWithoutAllergiesInput>
    connectOrCreate?: EpisodeCreateOrConnectWithoutAllergiesInput
    upsert?: EpisodeUpsertWithoutAllergiesInput
    connect?: EpisodeWhereUniqueInput
    update?: XOR<XOR<EpisodeUpdateToOneWithWhereWithoutAllergiesInput, EpisodeUpdateWithoutAllergiesInput>, EpisodeUncheckedUpdateWithoutAllergiesInput>
  }

  export type EpisodeCreateNestedOneWithoutNotesInput = {
    create?: XOR<EpisodeCreateWithoutNotesInput, EpisodeUncheckedCreateWithoutNotesInput>
    connectOrCreate?: EpisodeCreateOrConnectWithoutNotesInput
    connect?: EpisodeWhereUniqueInput
  }

  export type EpisodeUpdateOneRequiredWithoutNotesNestedInput = {
    create?: XOR<EpisodeCreateWithoutNotesInput, EpisodeUncheckedCreateWithoutNotesInput>
    connectOrCreate?: EpisodeCreateOrConnectWithoutNotesInput
    upsert?: EpisodeUpsertWithoutNotesInput
    connect?: EpisodeWhereUniqueInput
    update?: XOR<XOR<EpisodeUpdateToOneWithWhereWithoutNotesInput, EpisodeUpdateWithoutNotesInput>, EpisodeUncheckedUpdateWithoutNotesInput>
  }

  export type EpisodeCreateNestedOneWithoutVitalsInput = {
    create?: XOR<EpisodeCreateWithoutVitalsInput, EpisodeUncheckedCreateWithoutVitalsInput>
    connectOrCreate?: EpisodeCreateOrConnectWithoutVitalsInput
    connect?: EpisodeWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EpisodeUpdateOneRequiredWithoutVitalsNestedInput = {
    create?: XOR<EpisodeCreateWithoutVitalsInput, EpisodeUncheckedCreateWithoutVitalsInput>
    connectOrCreate?: EpisodeCreateOrConnectWithoutVitalsInput
    upsert?: EpisodeUpsertWithoutVitalsInput
    connect?: EpisodeWhereUniqueInput
    update?: XOR<XOR<EpisodeUpdateToOneWithWhereWithoutVitalsInput, EpisodeUpdateWithoutVitalsInput>, EpisodeUncheckedUpdateWithoutVitalsInput>
  }

  export type EpisodeCreateNestedOneWithoutHandoffsInput = {
    create?: XOR<EpisodeCreateWithoutHandoffsInput, EpisodeUncheckedCreateWithoutHandoffsInput>
    connectOrCreate?: EpisodeCreateOrConnectWithoutHandoffsInput
    connect?: EpisodeWhereUniqueInput
  }

  export type EnumHandoffStatusFieldUpdateOperationsInput = {
    set?: $Enums.HandoffStatus
  }

  export type EpisodeUpdateOneRequiredWithoutHandoffsNestedInput = {
    create?: XOR<EpisodeCreateWithoutHandoffsInput, EpisodeUncheckedCreateWithoutHandoffsInput>
    connectOrCreate?: EpisodeCreateOrConnectWithoutHandoffsInput
    upsert?: EpisodeUpsertWithoutHandoffsInput
    connect?: EpisodeWhereUniqueInput
    update?: XOR<XOR<EpisodeUpdateToOneWithWhereWithoutHandoffsInput, EpisodeUpdateWithoutHandoffsInput>, EpisodeUncheckedUpdateWithoutHandoffsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumHandoffStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.HandoffStatus | EnumHandoffStatusFieldRefInput<$PrismaModel>
    in?: $Enums.HandoffStatus[] | ListEnumHandoffStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.HandoffStatus[] | ListEnumHandoffStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumHandoffStatusFilter<$PrismaModel> | $Enums.HandoffStatus
  }

  export type NestedEnumHandoffStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HandoffStatus | EnumHandoffStatusFieldRefInput<$PrismaModel>
    in?: $Enums.HandoffStatus[] | ListEnumHandoffStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.HandoffStatus[] | ListEnumHandoffStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumHandoffStatusWithAggregatesFilter<$PrismaModel> | $Enums.HandoffStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumHandoffStatusFilter<$PrismaModel>
    _max?: NestedEnumHandoffStatusFilter<$PrismaModel>
  }

  export type AuditLogCreateWithoutActorInput = {
    id?: bigint | number
    seq: bigint | number
    prevHash: string
    entryHash: string
    actorRole: string
    patientId?: string | null
    episodeId?: string | null
    action: string
    entity: string
    entityId?: string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    serverTs?: Date | string
  }

  export type AuditLogUncheckedCreateWithoutActorInput = {
    id?: bigint | number
    seq: bigint | number
    prevHash: string
    entryHash: string
    actorRole: string
    patientId?: string | null
    episodeId?: string | null
    action: string
    entity: string
    entityId?: string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    serverTs?: Date | string
  }

  export type AuditLogCreateOrConnectWithoutActorInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput>
  }

  export type AuditLogCreateManyActorInputEnvelope = {
    data: AuditLogCreateManyActorInput | AuditLogCreateManyActorInput[]
    skipDuplicates?: boolean
  }

  export type AuditLogUpsertWithWhereUniqueWithoutActorInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutActorInput, AuditLogUncheckedUpdateWithoutActorInput>
    create: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutActorInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutActorInput, AuditLogUncheckedUpdateWithoutActorInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutActorInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutActorInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    OR?: AuditLogScalarWhereInput[]
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    id?: BigIntFilter<"AuditLog"> | bigint | number
    seq?: BigIntFilter<"AuditLog"> | bigint | number
    prevHash?: StringFilter<"AuditLog"> | string
    entryHash?: StringFilter<"AuditLog"> | string
    actorId?: StringFilter<"AuditLog"> | string
    actorRole?: StringFilter<"AuditLog"> | string
    patientId?: StringNullableFilter<"AuditLog"> | string | null
    episodeId?: StringNullableFilter<"AuditLog"> | string | null
    action?: StringFilter<"AuditLog"> | string
    entity?: StringFilter<"AuditLog"> | string
    entityId?: StringNullableFilter<"AuditLog"> | string | null
    oldValue?: JsonNullableFilter<"AuditLog">
    newValue?: JsonNullableFilter<"AuditLog">
    reason?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    serverTs?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type UserCreateWithoutAuditEntriesInput = {
    id?: string
    email: string
    passwordHash: string
    fullName: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutAuditEntriesInput = {
    id?: string
    email: string
    passwordHash: string
    fullName: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutAuditEntriesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAuditEntriesInput, UserUncheckedCreateWithoutAuditEntriesInput>
  }

  export type UserUpsertWithoutAuditEntriesInput = {
    update: XOR<UserUpdateWithoutAuditEntriesInput, UserUncheckedUpdateWithoutAuditEntriesInput>
    create: XOR<UserCreateWithoutAuditEntriesInput, UserUncheckedCreateWithoutAuditEntriesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAuditEntriesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAuditEntriesInput, UserUncheckedUpdateWithoutAuditEntriesInput>
  }

  export type UserUpdateWithoutAuditEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutAuditEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpisodeCreateWithoutPatientInput = {
    id?: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    allergies?: AllergyCreateNestedManyWithoutEpisodeInput
    notes?: NoteCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeUncheckedCreateWithoutPatientInput = {
    id?: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    allergies?: AllergyUncheckedCreateNestedManyWithoutEpisodeInput
    notes?: NoteUncheckedCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignUncheckedCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffUncheckedCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeCreateOrConnectWithoutPatientInput = {
    where: EpisodeWhereUniqueInput
    create: XOR<EpisodeCreateWithoutPatientInput, EpisodeUncheckedCreateWithoutPatientInput>
  }

  export type EpisodeCreateManyPatientInputEnvelope = {
    data: EpisodeCreateManyPatientInput | EpisodeCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type AllergyCreateWithoutPatientInput = {
    id?: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
    episode: EpisodeCreateNestedOneWithoutAllergiesInput
  }

  export type AllergyUncheckedCreateWithoutPatientInput = {
    id?: string
    episodeId: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
  }

  export type AllergyCreateOrConnectWithoutPatientInput = {
    where: AllergyWhereUniqueInput
    create: XOR<AllergyCreateWithoutPatientInput, AllergyUncheckedCreateWithoutPatientInput>
  }

  export type AllergyCreateManyPatientInputEnvelope = {
    data: AllergyCreateManyPatientInput | AllergyCreateManyPatientInput[]
    skipDuplicates?: boolean
  }

  export type EpisodeUpsertWithWhereUniqueWithoutPatientInput = {
    where: EpisodeWhereUniqueInput
    update: XOR<EpisodeUpdateWithoutPatientInput, EpisodeUncheckedUpdateWithoutPatientInput>
    create: XOR<EpisodeCreateWithoutPatientInput, EpisodeUncheckedCreateWithoutPatientInput>
  }

  export type EpisodeUpdateWithWhereUniqueWithoutPatientInput = {
    where: EpisodeWhereUniqueInput
    data: XOR<EpisodeUpdateWithoutPatientInput, EpisodeUncheckedUpdateWithoutPatientInput>
  }

  export type EpisodeUpdateManyWithWhereWithoutPatientInput = {
    where: EpisodeScalarWhereInput
    data: XOR<EpisodeUpdateManyMutationInput, EpisodeUncheckedUpdateManyWithoutPatientInput>
  }

  export type EpisodeScalarWhereInput = {
    AND?: EpisodeScalarWhereInput | EpisodeScalarWhereInput[]
    OR?: EpisodeScalarWhereInput[]
    NOT?: EpisodeScalarWhereInput | EpisodeScalarWhereInput[]
    id?: StringFilter<"Episode"> | string
    patientId?: StringFilter<"Episode"> | string
    admissionDate?: DateTimeFilter<"Episode"> | Date | string
    admissionType?: StringFilter<"Episode"> | string
    chiefComplaint?: StringNullableFilter<"Episode"> | string | null
    status?: StringFilter<"Episode"> | string
    room?: StringNullableFilter<"Episode"> | string | null
    bed?: StringNullableFilter<"Episode"> | string | null
    attendingDoctor?: StringNullableFilter<"Episode"> | string | null
    createdAt?: DateTimeFilter<"Episode"> | Date | string
    updatedAt?: DateTimeFilter<"Episode"> | Date | string
  }

  export type AllergyUpsertWithWhereUniqueWithoutPatientInput = {
    where: AllergyWhereUniqueInput
    update: XOR<AllergyUpdateWithoutPatientInput, AllergyUncheckedUpdateWithoutPatientInput>
    create: XOR<AllergyCreateWithoutPatientInput, AllergyUncheckedCreateWithoutPatientInput>
  }

  export type AllergyUpdateWithWhereUniqueWithoutPatientInput = {
    where: AllergyWhereUniqueInput
    data: XOR<AllergyUpdateWithoutPatientInput, AllergyUncheckedUpdateWithoutPatientInput>
  }

  export type AllergyUpdateManyWithWhereWithoutPatientInput = {
    where: AllergyScalarWhereInput
    data: XOR<AllergyUpdateManyMutationInput, AllergyUncheckedUpdateManyWithoutPatientInput>
  }

  export type AllergyScalarWhereInput = {
    AND?: AllergyScalarWhereInput | AllergyScalarWhereInput[]
    OR?: AllergyScalarWhereInput[]
    NOT?: AllergyScalarWhereInput | AllergyScalarWhereInput[]
    id?: StringFilter<"Allergy"> | string
    patientId?: StringFilter<"Allergy"> | string
    episodeId?: StringFilter<"Allergy"> | string
    allergen?: StringFilter<"Allergy"> | string
    type?: StringFilter<"Allergy"> | string
    reaction?: StringNullableFilter<"Allergy"> | string | null
    severity?: StringFilter<"Allergy"> | string
    status?: StringFilter<"Allergy"> | string
    createdAt?: DateTimeFilter<"Allergy"> | Date | string
    createdBy?: StringFilter<"Allergy"> | string
  }

  export type PatientCreateWithoutEpisodesInput = {
    id?: string
    expedienteNumber: string
    firstName: string
    lastName: string
    birthDate?: Date | string | null
    age?: number | null
    sex: string
    createdAt?: Date | string
    updatedAt?: Date | string
    allergies?: AllergyCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutEpisodesInput = {
    id?: string
    expedienteNumber: string
    firstName: string
    lastName: string
    birthDate?: Date | string | null
    age?: number | null
    sex: string
    createdAt?: Date | string
    updatedAt?: Date | string
    allergies?: AllergyUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutEpisodesInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutEpisodesInput, PatientUncheckedCreateWithoutEpisodesInput>
  }

  export type AllergyCreateWithoutEpisodeInput = {
    id?: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
    patient: PatientCreateNestedOneWithoutAllergiesInput
  }

  export type AllergyUncheckedCreateWithoutEpisodeInput = {
    id?: string
    patientId: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
  }

  export type AllergyCreateOrConnectWithoutEpisodeInput = {
    where: AllergyWhereUniqueInput
    create: XOR<AllergyCreateWithoutEpisodeInput, AllergyUncheckedCreateWithoutEpisodeInput>
  }

  export type AllergyCreateManyEpisodeInputEnvelope = {
    data: AllergyCreateManyEpisodeInput | AllergyCreateManyEpisodeInput[]
    skipDuplicates?: boolean
  }

  export type NoteCreateWithoutEpisodeInput = {
    id?: string
    subjective?: string | null
    objective?: string | null
    assessment?: string | null
    plan?: string | null
    status?: string
    createdBy: string
    createdAt?: Date | string
  }

  export type NoteUncheckedCreateWithoutEpisodeInput = {
    id?: string
    subjective?: string | null
    objective?: string | null
    assessment?: string | null
    plan?: string | null
    status?: string
    createdBy: string
    createdAt?: Date | string
  }

  export type NoteCreateOrConnectWithoutEpisodeInput = {
    where: NoteWhereUniqueInput
    create: XOR<NoteCreateWithoutEpisodeInput, NoteUncheckedCreateWithoutEpisodeInput>
  }

  export type NoteCreateManyEpisodeInputEnvelope = {
    data: NoteCreateManyEpisodeInput | NoteCreateManyEpisodeInput[]
    skipDuplicates?: boolean
  }

  export type VitalSignCreateWithoutEpisodeInput = {
    id?: string
    systolic?: number | null
    diastolic?: number | null
    heartRate?: number | null
    respiratoryRate?: number | null
    temperature?: number | null
    oxygenSat?: number | null
    glucose?: number | null
    painScale?: number | null
    recordedBy: string
    createdAt?: Date | string
  }

  export type VitalSignUncheckedCreateWithoutEpisodeInput = {
    id?: string
    systolic?: number | null
    diastolic?: number | null
    heartRate?: number | null
    respiratoryRate?: number | null
    temperature?: number | null
    oxygenSat?: number | null
    glucose?: number | null
    painScale?: number | null
    recordedBy: string
    createdAt?: Date | string
  }

  export type VitalSignCreateOrConnectWithoutEpisodeInput = {
    where: VitalSignWhereUniqueInput
    create: XOR<VitalSignCreateWithoutEpisodeInput, VitalSignUncheckedCreateWithoutEpisodeInput>
  }

  export type VitalSignCreateManyEpisodeInputEnvelope = {
    data: VitalSignCreateManyEpisodeInput | VitalSignCreateManyEpisodeInput[]
    skipDuplicates?: boolean
  }

  export type HandoffCreateWithoutEpisodeInput = {
    id?: string
    entregadoPor: string
    recibidoPor: string
    observaciones?: string | null
    status?: $Enums.HandoffStatus
    createdAt?: Date | string
    aceptadoAt?: Date | string | null
  }

  export type HandoffUncheckedCreateWithoutEpisodeInput = {
    id?: string
    entregadoPor: string
    recibidoPor: string
    observaciones?: string | null
    status?: $Enums.HandoffStatus
    createdAt?: Date | string
    aceptadoAt?: Date | string | null
  }

  export type HandoffCreateOrConnectWithoutEpisodeInput = {
    where: HandoffWhereUniqueInput
    create: XOR<HandoffCreateWithoutEpisodeInput, HandoffUncheckedCreateWithoutEpisodeInput>
  }

  export type HandoffCreateManyEpisodeInputEnvelope = {
    data: HandoffCreateManyEpisodeInput | HandoffCreateManyEpisodeInput[]
    skipDuplicates?: boolean
  }

  export type PatientUpsertWithoutEpisodesInput = {
    update: XOR<PatientUpdateWithoutEpisodesInput, PatientUncheckedUpdateWithoutEpisodesInput>
    create: XOR<PatientCreateWithoutEpisodesInput, PatientUncheckedCreateWithoutEpisodesInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutEpisodesInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutEpisodesInput, PatientUncheckedUpdateWithoutEpisodesInput>
  }

  export type PatientUpdateWithoutEpisodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    expedienteNumber?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    sex?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allergies?: AllergyUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutEpisodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    expedienteNumber?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    sex?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allergies?: AllergyUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type AllergyUpsertWithWhereUniqueWithoutEpisodeInput = {
    where: AllergyWhereUniqueInput
    update: XOR<AllergyUpdateWithoutEpisodeInput, AllergyUncheckedUpdateWithoutEpisodeInput>
    create: XOR<AllergyCreateWithoutEpisodeInput, AllergyUncheckedCreateWithoutEpisodeInput>
  }

  export type AllergyUpdateWithWhereUniqueWithoutEpisodeInput = {
    where: AllergyWhereUniqueInput
    data: XOR<AllergyUpdateWithoutEpisodeInput, AllergyUncheckedUpdateWithoutEpisodeInput>
  }

  export type AllergyUpdateManyWithWhereWithoutEpisodeInput = {
    where: AllergyScalarWhereInput
    data: XOR<AllergyUpdateManyMutationInput, AllergyUncheckedUpdateManyWithoutEpisodeInput>
  }

  export type NoteUpsertWithWhereUniqueWithoutEpisodeInput = {
    where: NoteWhereUniqueInput
    update: XOR<NoteUpdateWithoutEpisodeInput, NoteUncheckedUpdateWithoutEpisodeInput>
    create: XOR<NoteCreateWithoutEpisodeInput, NoteUncheckedCreateWithoutEpisodeInput>
  }

  export type NoteUpdateWithWhereUniqueWithoutEpisodeInput = {
    where: NoteWhereUniqueInput
    data: XOR<NoteUpdateWithoutEpisodeInput, NoteUncheckedUpdateWithoutEpisodeInput>
  }

  export type NoteUpdateManyWithWhereWithoutEpisodeInput = {
    where: NoteScalarWhereInput
    data: XOR<NoteUpdateManyMutationInput, NoteUncheckedUpdateManyWithoutEpisodeInput>
  }

  export type NoteScalarWhereInput = {
    AND?: NoteScalarWhereInput | NoteScalarWhereInput[]
    OR?: NoteScalarWhereInput[]
    NOT?: NoteScalarWhereInput | NoteScalarWhereInput[]
    id?: StringFilter<"Note"> | string
    episodeId?: StringFilter<"Note"> | string
    subjective?: StringNullableFilter<"Note"> | string | null
    objective?: StringNullableFilter<"Note"> | string | null
    assessment?: StringNullableFilter<"Note"> | string | null
    plan?: StringNullableFilter<"Note"> | string | null
    status?: StringFilter<"Note"> | string
    createdBy?: StringFilter<"Note"> | string
    createdAt?: DateTimeFilter<"Note"> | Date | string
  }

  export type VitalSignUpsertWithWhereUniqueWithoutEpisodeInput = {
    where: VitalSignWhereUniqueInput
    update: XOR<VitalSignUpdateWithoutEpisodeInput, VitalSignUncheckedUpdateWithoutEpisodeInput>
    create: XOR<VitalSignCreateWithoutEpisodeInput, VitalSignUncheckedCreateWithoutEpisodeInput>
  }

  export type VitalSignUpdateWithWhereUniqueWithoutEpisodeInput = {
    where: VitalSignWhereUniqueInput
    data: XOR<VitalSignUpdateWithoutEpisodeInput, VitalSignUncheckedUpdateWithoutEpisodeInput>
  }

  export type VitalSignUpdateManyWithWhereWithoutEpisodeInput = {
    where: VitalSignScalarWhereInput
    data: XOR<VitalSignUpdateManyMutationInput, VitalSignUncheckedUpdateManyWithoutEpisodeInput>
  }

  export type VitalSignScalarWhereInput = {
    AND?: VitalSignScalarWhereInput | VitalSignScalarWhereInput[]
    OR?: VitalSignScalarWhereInput[]
    NOT?: VitalSignScalarWhereInput | VitalSignScalarWhereInput[]
    id?: StringFilter<"VitalSign"> | string
    episodeId?: StringFilter<"VitalSign"> | string
    systolic?: IntNullableFilter<"VitalSign"> | number | null
    diastolic?: IntNullableFilter<"VitalSign"> | number | null
    heartRate?: IntNullableFilter<"VitalSign"> | number | null
    respiratoryRate?: IntNullableFilter<"VitalSign"> | number | null
    temperature?: FloatNullableFilter<"VitalSign"> | number | null
    oxygenSat?: IntNullableFilter<"VitalSign"> | number | null
    glucose?: IntNullableFilter<"VitalSign"> | number | null
    painScale?: IntNullableFilter<"VitalSign"> | number | null
    recordedBy?: StringFilter<"VitalSign"> | string
    createdAt?: DateTimeFilter<"VitalSign"> | Date | string
  }

  export type HandoffUpsertWithWhereUniqueWithoutEpisodeInput = {
    where: HandoffWhereUniqueInput
    update: XOR<HandoffUpdateWithoutEpisodeInput, HandoffUncheckedUpdateWithoutEpisodeInput>
    create: XOR<HandoffCreateWithoutEpisodeInput, HandoffUncheckedCreateWithoutEpisodeInput>
  }

  export type HandoffUpdateWithWhereUniqueWithoutEpisodeInput = {
    where: HandoffWhereUniqueInput
    data: XOR<HandoffUpdateWithoutEpisodeInput, HandoffUncheckedUpdateWithoutEpisodeInput>
  }

  export type HandoffUpdateManyWithWhereWithoutEpisodeInput = {
    where: HandoffScalarWhereInput
    data: XOR<HandoffUpdateManyMutationInput, HandoffUncheckedUpdateManyWithoutEpisodeInput>
  }

  export type HandoffScalarWhereInput = {
    AND?: HandoffScalarWhereInput | HandoffScalarWhereInput[]
    OR?: HandoffScalarWhereInput[]
    NOT?: HandoffScalarWhereInput | HandoffScalarWhereInput[]
    id?: StringFilter<"Handoff"> | string
    episodeId?: StringFilter<"Handoff"> | string
    entregadoPor?: StringFilter<"Handoff"> | string
    recibidoPor?: StringFilter<"Handoff"> | string
    observaciones?: StringNullableFilter<"Handoff"> | string | null
    status?: EnumHandoffStatusFilter<"Handoff"> | $Enums.HandoffStatus
    createdAt?: DateTimeFilter<"Handoff"> | Date | string
    aceptadoAt?: DateTimeNullableFilter<"Handoff"> | Date | string | null
  }

  export type PatientCreateWithoutAllergiesInput = {
    id?: string
    expedienteNumber: string
    firstName: string
    lastName: string
    birthDate?: Date | string | null
    age?: number | null
    sex: string
    createdAt?: Date | string
    updatedAt?: Date | string
    episodes?: EpisodeCreateNestedManyWithoutPatientInput
  }

  export type PatientUncheckedCreateWithoutAllergiesInput = {
    id?: string
    expedienteNumber: string
    firstName: string
    lastName: string
    birthDate?: Date | string | null
    age?: number | null
    sex: string
    createdAt?: Date | string
    updatedAt?: Date | string
    episodes?: EpisodeUncheckedCreateNestedManyWithoutPatientInput
  }

  export type PatientCreateOrConnectWithoutAllergiesInput = {
    where: PatientWhereUniqueInput
    create: XOR<PatientCreateWithoutAllergiesInput, PatientUncheckedCreateWithoutAllergiesInput>
  }

  export type EpisodeCreateWithoutAllergiesInput = {
    id?: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutEpisodesInput
    notes?: NoteCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeUncheckedCreateWithoutAllergiesInput = {
    id?: string
    patientId: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    notes?: NoteUncheckedCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignUncheckedCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffUncheckedCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeCreateOrConnectWithoutAllergiesInput = {
    where: EpisodeWhereUniqueInput
    create: XOR<EpisodeCreateWithoutAllergiesInput, EpisodeUncheckedCreateWithoutAllergiesInput>
  }

  export type PatientUpsertWithoutAllergiesInput = {
    update: XOR<PatientUpdateWithoutAllergiesInput, PatientUncheckedUpdateWithoutAllergiesInput>
    create: XOR<PatientCreateWithoutAllergiesInput, PatientUncheckedCreateWithoutAllergiesInput>
    where?: PatientWhereInput
  }

  export type PatientUpdateToOneWithWhereWithoutAllergiesInput = {
    where?: PatientWhereInput
    data: XOR<PatientUpdateWithoutAllergiesInput, PatientUncheckedUpdateWithoutAllergiesInput>
  }

  export type PatientUpdateWithoutAllergiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    expedienteNumber?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    sex?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    episodes?: EpisodeUpdateManyWithoutPatientNestedInput
  }

  export type PatientUncheckedUpdateWithoutAllergiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    expedienteNumber?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    sex?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    episodes?: EpisodeUncheckedUpdateManyWithoutPatientNestedInput
  }

  export type EpisodeUpsertWithoutAllergiesInput = {
    update: XOR<EpisodeUpdateWithoutAllergiesInput, EpisodeUncheckedUpdateWithoutAllergiesInput>
    create: XOR<EpisodeCreateWithoutAllergiesInput, EpisodeUncheckedCreateWithoutAllergiesInput>
    where?: EpisodeWhereInput
  }

  export type EpisodeUpdateToOneWithWhereWithoutAllergiesInput = {
    where?: EpisodeWhereInput
    data: XOR<EpisodeUpdateWithoutAllergiesInput, EpisodeUncheckedUpdateWithoutAllergiesInput>
  }

  export type EpisodeUpdateWithoutAllergiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutEpisodesNestedInput
    notes?: NoteUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeUncheckedUpdateWithoutAllergiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NoteUncheckedUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUncheckedUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUncheckedUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeCreateWithoutNotesInput = {
    id?: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutEpisodesInput
    allergies?: AllergyCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeUncheckedCreateWithoutNotesInput = {
    id?: string
    patientId: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    allergies?: AllergyUncheckedCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignUncheckedCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffUncheckedCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeCreateOrConnectWithoutNotesInput = {
    where: EpisodeWhereUniqueInput
    create: XOR<EpisodeCreateWithoutNotesInput, EpisodeUncheckedCreateWithoutNotesInput>
  }

  export type EpisodeUpsertWithoutNotesInput = {
    update: XOR<EpisodeUpdateWithoutNotesInput, EpisodeUncheckedUpdateWithoutNotesInput>
    create: XOR<EpisodeCreateWithoutNotesInput, EpisodeUncheckedCreateWithoutNotesInput>
    where?: EpisodeWhereInput
  }

  export type EpisodeUpdateToOneWithWhereWithoutNotesInput = {
    where?: EpisodeWhereInput
    data: XOR<EpisodeUpdateWithoutNotesInput, EpisodeUncheckedUpdateWithoutNotesInput>
  }

  export type EpisodeUpdateWithoutNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutEpisodesNestedInput
    allergies?: AllergyUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeUncheckedUpdateWithoutNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allergies?: AllergyUncheckedUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUncheckedUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUncheckedUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeCreateWithoutVitalsInput = {
    id?: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutEpisodesInput
    allergies?: AllergyCreateNestedManyWithoutEpisodeInput
    notes?: NoteCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeUncheckedCreateWithoutVitalsInput = {
    id?: string
    patientId: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    allergies?: AllergyUncheckedCreateNestedManyWithoutEpisodeInput
    notes?: NoteUncheckedCreateNestedManyWithoutEpisodeInput
    handoffs?: HandoffUncheckedCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeCreateOrConnectWithoutVitalsInput = {
    where: EpisodeWhereUniqueInput
    create: XOR<EpisodeCreateWithoutVitalsInput, EpisodeUncheckedCreateWithoutVitalsInput>
  }

  export type EpisodeUpsertWithoutVitalsInput = {
    update: XOR<EpisodeUpdateWithoutVitalsInput, EpisodeUncheckedUpdateWithoutVitalsInput>
    create: XOR<EpisodeCreateWithoutVitalsInput, EpisodeUncheckedCreateWithoutVitalsInput>
    where?: EpisodeWhereInput
  }

  export type EpisodeUpdateToOneWithWhereWithoutVitalsInput = {
    where?: EpisodeWhereInput
    data: XOR<EpisodeUpdateWithoutVitalsInput, EpisodeUncheckedUpdateWithoutVitalsInput>
  }

  export type EpisodeUpdateWithoutVitalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutEpisodesNestedInput
    allergies?: AllergyUpdateManyWithoutEpisodeNestedInput
    notes?: NoteUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeUncheckedUpdateWithoutVitalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allergies?: AllergyUncheckedUpdateManyWithoutEpisodeNestedInput
    notes?: NoteUncheckedUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUncheckedUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeCreateWithoutHandoffsInput = {
    id?: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    patient: PatientCreateNestedOneWithoutEpisodesInput
    allergies?: AllergyCreateNestedManyWithoutEpisodeInput
    notes?: NoteCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeUncheckedCreateWithoutHandoffsInput = {
    id?: string
    patientId: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    allergies?: AllergyUncheckedCreateNestedManyWithoutEpisodeInput
    notes?: NoteUncheckedCreateNestedManyWithoutEpisodeInput
    vitals?: VitalSignUncheckedCreateNestedManyWithoutEpisodeInput
  }

  export type EpisodeCreateOrConnectWithoutHandoffsInput = {
    where: EpisodeWhereUniqueInput
    create: XOR<EpisodeCreateWithoutHandoffsInput, EpisodeUncheckedCreateWithoutHandoffsInput>
  }

  export type EpisodeUpsertWithoutHandoffsInput = {
    update: XOR<EpisodeUpdateWithoutHandoffsInput, EpisodeUncheckedUpdateWithoutHandoffsInput>
    create: XOR<EpisodeCreateWithoutHandoffsInput, EpisodeUncheckedCreateWithoutHandoffsInput>
    where?: EpisodeWhereInput
  }

  export type EpisodeUpdateToOneWithWhereWithoutHandoffsInput = {
    where?: EpisodeWhereInput
    data: XOR<EpisodeUpdateWithoutHandoffsInput, EpisodeUncheckedUpdateWithoutHandoffsInput>
  }

  export type EpisodeUpdateWithoutHandoffsInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    patient?: PatientUpdateOneRequiredWithoutEpisodesNestedInput
    allergies?: AllergyUpdateManyWithoutEpisodeNestedInput
    notes?: NoteUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeUncheckedUpdateWithoutHandoffsInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allergies?: AllergyUncheckedUpdateManyWithoutEpisodeNestedInput
    notes?: NoteUncheckedUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUncheckedUpdateManyWithoutEpisodeNestedInput
  }

  export type AuditLogCreateManyActorInput = {
    id?: bigint | number
    seq: bigint | number
    prevHash: string
    entryHash: string
    actorRole: string
    patientId?: string | null
    episodeId?: string | null
    action: string
    entity: string
    entityId?: string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    serverTs?: Date | string
  }

  export type AuditLogUpdateWithoutActorInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    seq?: BigIntFieldUpdateOperationsInput | bigint | number
    prevHash?: StringFieldUpdateOperationsInput | string
    entryHash?: StringFieldUpdateOperationsInput | string
    actorRole?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    episodeId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    serverTs?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateWithoutActorInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    seq?: BigIntFieldUpdateOperationsInput | bigint | number
    prevHash?: StringFieldUpdateOperationsInput | string
    entryHash?: StringFieldUpdateOperationsInput | string
    actorRole?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    episodeId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    serverTs?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyWithoutActorInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    seq?: BigIntFieldUpdateOperationsInput | bigint | number
    prevHash?: StringFieldUpdateOperationsInput | string
    entryHash?: StringFieldUpdateOperationsInput | string
    actorRole?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    episodeId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    oldValue?: NullableJsonNullValueInput | InputJsonValue
    newValue?: NullableJsonNullValueInput | InputJsonValue
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    serverTs?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpisodeCreateManyPatientInput = {
    id?: string
    admissionDate?: Date | string
    admissionType: string
    chiefComplaint?: string | null
    status?: string
    room?: string | null
    bed?: string | null
    attendingDoctor?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AllergyCreateManyPatientInput = {
    id?: string
    episodeId: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
  }

  export type EpisodeUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allergies?: AllergyUpdateManyWithoutEpisodeNestedInput
    notes?: NoteUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allergies?: AllergyUncheckedUpdateManyWithoutEpisodeNestedInput
    notes?: NoteUncheckedUpdateManyWithoutEpisodeNestedInput
    vitals?: VitalSignUncheckedUpdateManyWithoutEpisodeNestedInput
    handoffs?: HandoffUncheckedUpdateManyWithoutEpisodeNestedInput
  }

  export type EpisodeUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    admissionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionType?: StringFieldUpdateOperationsInput | string
    chiefComplaint?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    room?: NullableStringFieldUpdateOperationsInput | string | null
    bed?: NullableStringFieldUpdateOperationsInput | string | null
    attendingDoctor?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AllergyUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    episode?: EpisodeUpdateOneRequiredWithoutAllergiesNestedInput
  }

  export type AllergyUncheckedUpdateWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type AllergyUncheckedUpdateManyWithoutPatientInput = {
    id?: StringFieldUpdateOperationsInput | string
    episodeId?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type AllergyCreateManyEpisodeInput = {
    id?: string
    patientId: string
    allergen: string
    type: string
    reaction?: string | null
    severity: string
    status?: string
    createdAt?: Date | string
    createdBy: string
  }

  export type NoteCreateManyEpisodeInput = {
    id?: string
    subjective?: string | null
    objective?: string | null
    assessment?: string | null
    plan?: string | null
    status?: string
    createdBy: string
    createdAt?: Date | string
  }

  export type VitalSignCreateManyEpisodeInput = {
    id?: string
    systolic?: number | null
    diastolic?: number | null
    heartRate?: number | null
    respiratoryRate?: number | null
    temperature?: number | null
    oxygenSat?: number | null
    glucose?: number | null
    painScale?: number | null
    recordedBy: string
    createdAt?: Date | string
  }

  export type HandoffCreateManyEpisodeInput = {
    id?: string
    entregadoPor: string
    recibidoPor: string
    observaciones?: string | null
    status?: $Enums.HandoffStatus
    createdAt?: Date | string
    aceptadoAt?: Date | string | null
  }

  export type AllergyUpdateWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    patient?: PatientUpdateOneRequiredWithoutAllergiesNestedInput
  }

  export type AllergyUncheckedUpdateWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type AllergyUncheckedUpdateManyWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    allergen?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    reaction?: NullableStringFieldUpdateOperationsInput | string | null
    severity?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type NoteUpdateWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    subjective?: NullableStringFieldUpdateOperationsInput | string | null
    objective?: NullableStringFieldUpdateOperationsInput | string | null
    assessment?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NoteUncheckedUpdateWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    subjective?: NullableStringFieldUpdateOperationsInput | string | null
    objective?: NullableStringFieldUpdateOperationsInput | string | null
    assessment?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NoteUncheckedUpdateManyWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    subjective?: NullableStringFieldUpdateOperationsInput | string | null
    objective?: NullableStringFieldUpdateOperationsInput | string | null
    assessment?: NullableStringFieldUpdateOperationsInput | string | null
    plan?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VitalSignUpdateWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    systolic?: NullableIntFieldUpdateOperationsInput | number | null
    diastolic?: NullableIntFieldUpdateOperationsInput | number | null
    heartRate?: NullableIntFieldUpdateOperationsInput | number | null
    respiratoryRate?: NullableIntFieldUpdateOperationsInput | number | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    oxygenSat?: NullableIntFieldUpdateOperationsInput | number | null
    glucose?: NullableIntFieldUpdateOperationsInput | number | null
    painScale?: NullableIntFieldUpdateOperationsInput | number | null
    recordedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VitalSignUncheckedUpdateWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    systolic?: NullableIntFieldUpdateOperationsInput | number | null
    diastolic?: NullableIntFieldUpdateOperationsInput | number | null
    heartRate?: NullableIntFieldUpdateOperationsInput | number | null
    respiratoryRate?: NullableIntFieldUpdateOperationsInput | number | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    oxygenSat?: NullableIntFieldUpdateOperationsInput | number | null
    glucose?: NullableIntFieldUpdateOperationsInput | number | null
    painScale?: NullableIntFieldUpdateOperationsInput | number | null
    recordedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VitalSignUncheckedUpdateManyWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    systolic?: NullableIntFieldUpdateOperationsInput | number | null
    diastolic?: NullableIntFieldUpdateOperationsInput | number | null
    heartRate?: NullableIntFieldUpdateOperationsInput | number | null
    respiratoryRate?: NullableIntFieldUpdateOperationsInput | number | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    oxygenSat?: NullableIntFieldUpdateOperationsInput | number | null
    glucose?: NullableIntFieldUpdateOperationsInput | number | null
    painScale?: NullableIntFieldUpdateOperationsInput | number | null
    recordedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HandoffUpdateWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    entregadoPor?: StringFieldUpdateOperationsInput | string
    recibidoPor?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumHandoffStatusFieldUpdateOperationsInput | $Enums.HandoffStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aceptadoAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HandoffUncheckedUpdateWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    entregadoPor?: StringFieldUpdateOperationsInput | string
    recibidoPor?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumHandoffStatusFieldUpdateOperationsInput | $Enums.HandoffStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aceptadoAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HandoffUncheckedUpdateManyWithoutEpisodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    entregadoPor?: StringFieldUpdateOperationsInput | string
    recibidoPor?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumHandoffStatusFieldUpdateOperationsInput | $Enums.HandoffStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aceptadoAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}