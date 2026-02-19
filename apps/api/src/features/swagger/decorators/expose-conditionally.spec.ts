import { instanceToPlain, plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { ExposeConditionally } from './expose-conditionally';

describe('ExposeConditionally', () => {
  describe('when enabled is true', () => {
    it('should apply Expose decorator and include the property in transformation', () => {
      class TestClass {
        @ExposeConditionally({ enabled: true, name: 'test_field' })
        testProperty: string = 'test-value';
      }

      const instance = plainToInstance(TestClass, {
        test_field: 'transformed-value',
      });

      expect(instance.testProperty).toBe('transformed-value');

      const plain = instanceToPlain(instance);
      expect(plain).toHaveProperty('test_field');
      expect(plain.test_field).toBe('transformed-value');
    });

    it('should apply Expose decorator with default name when name is not provided', () => {
      class TestClass {
        @ExposeConditionally({ enabled: true })
        testProperty: string = 'test-value';
      }

      const instance = plainToInstance(TestClass, {
        testProperty: 'transformed-value',
      });

      expect(instance.testProperty).toBe('transformed-value');

      const plain = instanceToPlain(instance);
      expect(plain).toHaveProperty('testProperty');
      expect(plain.testProperty).toBe('transformed-value');
    });

    it('should pass through ExposeOptions correctly', () => {
      class TestClass {
        @ExposeConditionally({
          enabled: true,
          name: 'custom_name',
          groups: ['group1'],
        })
        testProperty: string = 'test-value';
      }

      const instance = plainToInstance(
        TestClass,
        {
          custom_name: 'transformed-value',
        },
        { groups: ['group1'] },
      );

      expect(instance.testProperty).toBe('transformed-value');

      const plain = instanceToPlain(instance, { groups: ['group1'] });
      expect(plain).toHaveProperty('custom_name');
      expect(plain.custom_name).toBe('transformed-value');
    });
  });

  describe('when enabled is false', () => {
    it('should apply Exclude decorator and exclude the property from serialization', () => {
      class TestClass {
        @ExposeConditionally({ enabled: false, name: 'test_field' })
        testProperty: string;
      }

      const instance = new TestClass();
      instance.testProperty = 'some-value';

      const plain = instanceToPlain(instance);
      expect(plain).not.toHaveProperty('test_field');
      expect(plain).not.toHaveProperty('testProperty');
    });

    it('should exclude the property from deserialization when excludeExtraneousValues is true', () => {
      class TestClass {
        @ExposeConditionally({ enabled: false, name: 'custom_name' })
        testProperty: string;
      }

      const instance = plainToInstance(
        TestClass,
        {
          custom_name: 'should-be-ignored',
        },
        { excludeExtraneousValues: true },
      );

      expect(instance.testProperty).toBeUndefined();

      const plain = instanceToPlain(instance);
      expect(plain).not.toHaveProperty('custom_name');
      expect(plain).not.toHaveProperty('testProperty');
    });
  });

  describe('integration with class-transformer', () => {
    it('should work correctly with multiple properties', () => {
      class TestClass {
        @ExposeConditionally({ enabled: true, name: 'exposed_field' })
        exposedProperty: string;

        @ExposeConditionally({ enabled: false, name: 'excluded_field' })
        excludedProperty: string;

        @ExposeConditionally({ enabled: true })
        defaultExposedProperty: string;
      }

      const instance = plainToInstance(
        TestClass,
        {
          exposed_field: 'exposed-value',
          excluded_field: 'excluded-value',
          defaultExposedProperty: 'default-value',
        },
        { excludeExtraneousValues: true },
      );

      expect(instance.exposedProperty).toBe('exposed-value');
      expect(instance.excludedProperty).toBeUndefined();
      expect(instance.defaultExposedProperty).toBe('default-value');

      const plain = instanceToPlain(instance);
      expect(plain).toHaveProperty('exposed_field');
      expect(plain.exposed_field).toBe('exposed-value');
      expect(plain).not.toHaveProperty('excluded_field');
      expect(plain).not.toHaveProperty('excludedProperty');
      expect(plain).toHaveProperty('defaultExposedProperty');
      expect(plain.defaultExposedProperty).toBe('default-value');
    });

    it('should handle nested objects correctly', () => {
      class NestedClass {
        @ExposeConditionally({ enabled: true, name: 'nested_field' })
        nestedProperty: string;
      }

      class TestClass {
        @ExposeConditionally({ enabled: true, name: 'main_field' })
        mainProperty: string;

        @ExposeConditionally({ enabled: false, name: 'nested' })
        nested: NestedClass;
      }

      const instance = plainToInstance(
        TestClass,
        {
          main_field: 'main-value',
          nested: {
            nested_field: 'nested-value',
          },
        },
        { excludeExtraneousValues: true },
      );

      expect(instance.mainProperty).toBe('main-value');
      expect(instance.nested).toBeUndefined();

      const plain = instanceToPlain(instance);
      expect(plain).toHaveProperty('main_field');
      expect(plain.main_field).toBe('main-value');
      expect(plain).not.toHaveProperty('nested');
    });
  });
});
