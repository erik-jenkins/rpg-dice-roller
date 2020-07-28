import StandardDice from '../../src/dice/StandardDice';
import RollResult from '../../src/results/RollResult';
import RollResults from '../../src/results/RollResults';
import Modifier from '../../src/modifiers/Modifier';
import FudgeDice from '../../src/dice/FudgeDice';
import RequiredArgumentError from '../../src/exceptions/RequiredArgumentError';

describe('FudgeDice', () => {
  describe('Initialisation', () => {
    test('model structure', () => {
      const die = new FudgeDice('4dF');

      // assert that the die is a PercentileDie and that it extends StandardDice
      expect(die).toBeInstanceOf(FudgeDice);
      expect(die).toBeInstanceOf(StandardDice);
      expect(die).toEqual(expect.objectContaining({
        notation: '4dF',
        sides: 'F.2',
        qty: 1,
        modifiers: null,
        max: 1,
        min: -1,
        name: 'fudge',
        nonBlanks: 2,
        roll: expect.any(Function),
        rollOnce: expect.any(Function),
        toJSON: expect.any(Function),
        toString: expect.any(Function),
      }));
    });

    test('constructor requires notation', () => {
      expect(() => {
        new FudgeDice();
      }).toThrow(RequiredArgumentError);

      expect(() => {
        new FudgeDice(false);
      }).toThrow(RequiredArgumentError);

      expect(() => {
        new FudgeDice(null);
      }).toThrow(RequiredArgumentError);

      expect(() => {
        new FudgeDice(undefined);
      }).toThrow(RequiredArgumentError);
    });
  });

  describe('Sides / non-blanks', () => {
    test('no sides default to 2', () => {
      let die = new FudgeDice('4dF');

      expect(die.nonBlanks).toBe(2);
      expect(die.sides).toEqual('F.2');

      die = new FudgeDice('4dF', null);

      expect(die.nonBlanks).toBe(2);
      expect(die.sides).toEqual('F.2');

      die = new FudgeDice('4dF', false);

      expect(die.nonBlanks).toBe(2);
      expect(die.sides).toEqual('F.2');
    });

    test('can set sides to 2', () => {
      const die = new FudgeDice('4dF', 2);
      expect(die.sides).toEqual('F.2');
      expect(die.nonBlanks).toBe(2);
    });

    test('can set sides to 1', () => {
      const die = new FudgeDice('4dF', 1);
      expect(die.sides).toEqual('F.1');
      expect(die.nonBlanks).toBe(1);
    });

    test('sides must be 1 or 2', () => {
      expect(() => {
        new FudgeDice('4dF', 0);
      }).toThrow(RangeError);

      expect(() => {
        new FudgeDice('4dF', 3);
      }).toThrow(RangeError);

      expect(() => {
        new FudgeDice('4dF', -1);
      }).toThrow(RangeError);

      expect(() => {
        new FudgeDice('4dF', 6);
      }).toThrow(RangeError);

      expect(() => {
        new FudgeDice('4dF', []);
      }).toThrow(RangeError);

      expect(() => {
        new FudgeDice('4dF', { nonBlanks: 2 });
      }).toThrow(RangeError);

      expect(() => {
        new FudgeDice('4dF', 'foo');
      }).toThrow(RangeError);
    });
  });

  describe('Quantity', () => {
    test('qty must be numeric', () => {
      let die = new FudgeDice('4dF', null, 8);
      expect(die.qty).toBe(8);

      expect(() => {
        die = new FudgeDice('4dF', null, 'foo');
      }).toThrow(TypeError);

      expect(() => {
        die = new FudgeDice('4dF', null, false);
      }).toThrow(TypeError);

      expect(() => {
        die = new FudgeDice('4dF', null, true);
      }).toThrow(TypeError);

      expect(() => {
        die = new FudgeDice('4dF', null, []);
      }).toThrow(TypeError);

      expect(() => {
        die = new FudgeDice('4dF', null, { qty: 4 });
      }).toThrow(TypeError);
    });

    test('qty must be positive non-zero', () => {
      let die = new FudgeDice('4dF', null, 1);
      expect(die.qty).toBe(1);

      die = new FudgeDice('4dF', null, 324);
      expect(die.qty).toBe(324);

      expect(() => {
        die = new FudgeDice('4dF', null, 0);
      }).toThrow(TypeError);

      expect(() => {
        die = new FudgeDice('4dF', null, -42);
      }).toThrow(TypeError);

      expect(() => {
        die = new FudgeDice('4dF', null, -1);
      }).toThrow(TypeError);
    });
  });

  describe('Average', () => {
    test('average is correct for single die', () => {
      let die = new FudgeDice('dF');
      expect(die.average).toBe(0);

      die = new FudgeDice('dF.1', 1);
      expect(die.average).toBe(0);
    });

    test('average is unaffected when rolling multiple', () => {
      let die = new FudgeDice('2dF', 2, 2);
      expect(die.average).toBe(0);

      die = new FudgeDice('400dF', 2, 400);
      expect(die.average).toBe(0);

      die = new FudgeDice('56dF.1', 1, 56);
      expect(die.average).toBe(0);

      die = new FudgeDice('145dF.1', 1, 145);
      expect(die.average).toBe(0);
    });
  });

  describe('Modifiers', () => {
    test('setting modifiers in constructor calls setter', () => {
      const spy = jest.spyOn(FudgeDice.prototype, 'modifiers', 'set');
      const modifiers = new Map(Object.entries({ foo: new Modifier('m') }));

      new FudgeDice('4dF', null, 1, modifiers);

      expect(spy).toHaveBeenCalledTimes(1);

      // remove the spy
      spy.mockRestore();
    });

    test('can set modifiers with Map', () => {
      const modifiers = new Map(Object.entries({ foo: new Modifier('m') }));
      const die = new FudgeDice('4dF', null, 1);

      die.modifiers = modifiers;

      expect(die.modifiers).toBeInstanceOf(Map);
      expect(die.modifiers).toEqual(modifiers);
    });

    test('can set modifiers with Object', () => {
      const modifier = new Modifier('m');
      const die = new FudgeDice('4dF', null, 1);

      die.modifiers = { foo: modifier };

      expect(die.modifiers).toBeInstanceOf(Map);
      expect(die.modifiers.get('foo')).toEqual(modifier);
    });

    test('can set modifiers with Array', () => {
      const modifiers = [new Modifier('m')];
      const die = new FudgeDice('4dF', null, 1);

      die.modifiers = modifiers;

      expect(die.modifiers).toBeInstanceOf(Map);
      expect(die.modifiers.get('modifier')).toEqual(modifiers[0]);
    });

    test('throws error if modifiers type is invalid', () => {
      expect(() => {
        new FudgeDice('4dF', null, 1, 'foo');
      }).toThrow(TypeError);

      expect(() => {
        new FudgeDice('4dF', null, 1, 351);
      }).toThrow(TypeError);

      expect(() => {
        const modifiers = new Map(Object.entries({ foo: 'bar' }));
        new FudgeDice('4dF', null, 1, modifiers);
      }).toThrow(TypeError);

      expect(() => {
        const modifiers = { foo: 'bar' };
        new FudgeDice('4dF', null, 1, modifiers);
      }).toThrow(TypeError);

      expect(() => {
        const modifiers = ['bar'];
        new FudgeDice('4dF', null, 1, modifiers);
      }).toThrow(TypeError);
    });

    test('modifiers list always returns in correct order', () => {
      // create modifiers and define their order
      const mod1 = new Modifier('m1');
      mod1.order = 4;
      const mod2 = new Modifier('m2');
      mod2.order = 3;
      const mod3 = new Modifier('m3');
      mod3.order = 1;
      const mod4 = new Modifier('m4');
      mod4.order = 2;

      // create the dice instance
      const die = new FudgeDice('4dF', null, 4);

      die.modifiers = {
        mod1, mod2, mod3, mod4,
      };

      // get the modifier keys
      const modKeys = [...die.modifiers.keys()];
      // check that the order matches the defined modifier orders
      expect(modKeys[0]).toEqual('mod3');
      expect(modKeys[1]).toEqual('mod4');
      expect(modKeys[2]).toEqual('mod2');
      expect(modKeys[3]).toEqual('mod1');
    });
  });

  describe('Output', () => {
    test('JSON output is correct', () => {
      const die = new FudgeDice('4dF', null, 4);

      // json encode, to get the encoded string, then decode so we can compare the object
      // this allows us to check that the output is correct, but ignoring the order of the
      // returned properties
      expect(JSON.parse(JSON.stringify(die))).toEqual({
        average: 0,
        max: 1,
        min: -1,
        modifiers: null,
        name: 'fudge',
        notation: '4dF',
        qty: 4,
        sides: 'F.2',
        type: 'die',
      });
    });

    test('String output is correct', () => {
      let die = new FudgeDice('4dF', null, 4);

      expect(die.toString()).toEqual('4dF');

      die = new FudgeDice('4dF.1', 1, 4);

      expect(die.toString()).toEqual('4dF.1');
    });
  });

  describe('Rolling', () => {
    test('rollOnce returns a RollResult object', () => {
      expect((new FudgeDice('1dF.2', 2, 1)).rollOnce()).toBeInstanceOf(RollResult);
    });

    test('rollOnce rolls between min and max (Inclusive)', () => {
      const die = new FudgeDice('1dF.2', 2, 1);
      const iterations = 1000;

      // run the test multiple times to try and ensure consistency
      for (let i = 0; i < iterations; ++i) {
        const result = die.rollOnce();

        expect(result.value).toBeGreaterThanOrEqual(-1);
        expect(result.value).toBeLessThanOrEqual(1);
      }
    });

    test('rollOnce rolls between min and max (Inclusive) for F.1', () => {
      const die = new FudgeDice('1dF.1', 1, 1);
      const iterations = 1000;

      // run the test multiple times to try and ensure consistency
      for (let i = 0; i < iterations; ++i) {
        const result = die.rollOnce();

        expect(result.value).toBeGreaterThanOrEqual(-1);
        expect(result.value).toBeLessThanOrEqual(1);
      }
    });

    test('roll returns a RollResults object', () => {
      expect((new FudgeDice('4dF', null, 1)).roll()).toBeInstanceOf(RollResults);
    });

    test('rollOnce gets called when rolling', () => {
      const die = new FudgeDice('4dF', null, 4);
      // create a spy to listen for the Model.rollOnce method to have been triggered
      const spy = jest.spyOn(die, 'rollOnce');

      // roll the dice
      die.roll();

      expect(spy).toHaveBeenCalledTimes(4);

      // remove the spy
      spy.mockRestore();
    });

    test('roll returns correct number of rolls', () => {
      const die = new FudgeDice('4dF', null, 4);

      expect(die.roll()).toHaveLength(4);
    });
  });

  describe('Readonly properties', () => {
    test('cannot change max value', () => {
      const die = new FudgeDice('4dF', null, 4);

      expect(() => {
        die.max = 450;
      }).toThrow(TypeError);
    });

    test('cannot change min value', () => {
      const die = new FudgeDice('4dF', null, 4);

      expect(() => {
        die.min = 450;
      }).toThrow(TypeError);
    });

    test('cannot change name value', () => {
      const die = new FudgeDice('4dF', null, 4);

      expect(() => {
        die.name = 'Foo';
      }).toThrow(TypeError);
    });

    test('cannot change notation value', () => {
      const die = new FudgeDice('4dF', null, 4);

      expect(() => {
        die.notation = '6d4';
      }).toThrow(TypeError);
    });

    test('cannot change qty value', () => {
      const die = new FudgeDice('4dF', null, 4);

      expect(() => {
        die.qty = 6;
      }).toThrow(TypeError);
    });

    test('cannot change sides value', () => {
      const die = new FudgeDice('4dF', null, 4);

      expect(() => {
        die.sides = 2;
      }).toThrow(TypeError);
    });

    test('cannot change nonBlanks value', () => {
      const die = new FudgeDice('4dF', 1, 4);

      expect(() => {
        die.nonBlanks = 2;
      }).toThrow(TypeError);
    });
  });
});
