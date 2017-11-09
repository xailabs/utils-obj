import test from 'tape';

import ObjUtil from './ObjUtil';

test('ObjUtil.diff', t => {
    t.equals(ObjUtil.diff({ foo: 'a' }, { foo: 'a' }), null, 'Returns null when values are equal');
    t.deepEquals(ObjUtil.diff({ foo: 'a' }, { foo: 'b' }), ['foo'], 'Returns single diff key');
    t.deepEquals(
        ObjUtil.diff({ foo: 'a', bar: 'b' }, { foo: 'b', bar: 'c' }),
        ['foo', 'bar'],
        'Returns multiple diff keys'
    );
    t.deepEquals(
        ObjUtil.diff({ foo: 'a', bar: 'b' }, { foo: 'b', bar: 'b' }),
        ['foo'],
        'Does not return unchanged keys'
    );
    t.deepEquals(
        ObjUtil.diff({ foo: 'a', bar: 'b' }, { foo: 'b', bar: 'c' }, ['foo']),
        ['foo'],
        'Returns diff of only the specified keys'
    );
    t.equals(
        ObjUtil.diff({ foo: 'a', bar: 'b' }, { foo: 'a', bar: 'c' }, ['foo']),
        null,
        'Returns null if keys were specified but have no diff'
    );
    t.end();
});
