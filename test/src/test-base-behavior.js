/* global dolphin */
"use strict";

var expect = require('chai').expect;
var sinon = require('sinon');

var createBaseBehavior = require('../../src/base-behavior.js').createBaseBehavior;

var injectDataFromDolphin = null;

var dolphin = {
    setAttribute: function() {},
    onUpdated: function(func) { injectDataFromDolphin = func; }
};

var CustomElement = Polymer({
    is: 'custom-element',
    behaviors: [createBaseBehavior(dolphin)],
    observers: ['beanChangeObserver(theBean.*)'],
    beanChangeObserver: function(obj) {
        console.log(obj)
    }
});


describe('Simple Binding of a Dolphin Bean', function() {

    it('should set the initial value', function() {
        var element = new CustomElement();
        var bean1 = { theProperty: 'VALUE_1' };
        var bean2 = { theProperty: 'VALUE_X' };

        element.bind('theBean', bean1);
        expect(element.theBean).to.equal(bean1);

        element.bind('theBean', bean2);
        expect(element.theBean).to.equal(bean2);
    });



    it('should synchronize changes coming from Dolphin', sinon.test(function() {
        var element = new CustomElement();
        var bean = { theProperty: 'VALUE_1' };
        this.stub(element, 'beanChangeObserver');

        element.bind('theBean', bean);
        element.beanChangeObserver.reset();

        bean.theProperty = 'VALUE_2';
        injectDataFromDolphin(bean, 'theProperty', 'VALUE_2', 'VALUE_1');
        sinon.assert.calledWithExactly(element.beanChangeObserver, {path: 'theBean.theProperty', value: 'VALUE_2', base: bean});
    }));



    it('should not synchronize changes coming from Dolphin from an unbound bean', sinon.test(function() {
        var element = new CustomElement();
        var bean1 = { theProperty: 'VALUE_1' };
        var bean2 = { theProperty: 'VALUE_X' };
        this.stub(element, 'beanChangeObserver');

        element.bind('theBean', bean1);
        element.bind('theBean', bean2);
        element.beanChangeObserver.reset();

        bean1.theProperty = 'VALUE_2';
        injectDataFromDolphin(bean1, 'theProperty', 'VALUE_2', 'VALUE_1');
        sinon.assert.notCalled(element.beanChangeObserver);
    }));



    it('should synchronize changes coming from Polymer', sinon.test(function() {
        var element = new CustomElement();
        var bean = { theProperty: 'VALUE_1' };
        var setAttributeStub = this.stub(dolphin, 'setAttribute');
        setAttributeStub.returns('VALUE_1');

        element.bind('theBean', bean);

        element.set('theBean.theProperty', 'VALUE_2');
        sinon.assert.calledWithExactly(dolphin.setAttribute, bean, 'theProperty', 'VALUE_2');
    }));



    it('should not synchronize changes coming from Polymer from an unbound bean', sinon.test(function() {
        var element = new CustomElement();
        var bean1 = { theProperty: 'VALUE_1' };
        var bean2 = { theProperty: 'VALUE_X' };
        var setAttributeStub = this.stub(dolphin, 'setAttribute');

        element.bind('theBean', bean1);
        element.bind('theBean', bean2);
        setAttributeStub.returns('VALUE_X');

        element.set('theBean.theProperty', 'VALUE_3');
        sinon.assert.calledWithExactly(dolphin.setAttribute, bean2, 'theProperty', 'VALUE_3');
    }));
});





describe('Simple Binding of an Array', function() {

    it('tests not defined yet', sinon.test(function() {
        expect.fail(null, null, "Test not implemented yet");
    }));
});





describe('Deep Binding of a Bean within a Bean', function() {

    it('should set the initial value', function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var bean1 = { innerBean: innerBean1};
        var innerBean2 = { theProperty: 'VALUE_X' };
        var bean2 = { innerBean: innerBean2};

        element.bind('theBean', bean1);
        expect(element.theBean).to.equal(bean1);
        expect(element.theBean.innerBean).to.equal(innerBean1);

        element.bind('theBean', bean2);
        expect(element.theBean).to.equal(bean2);
        expect(element.theBean.innerBean).to.equal(innerBean2);
    });



    it('should synchronize changes of the nested Bean coming from Dolphin', sinon.test(function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var innerBean2 = { theProperty: 'VALUE_2' };
        var bean = { innerBean: innerBean1};
        this.stub(element, 'beanChangeObserver');

        element.bind('theBean', bean);
        element.beanChangeObserver.reset();

        bean.innerBean = innerBean2;
        injectDataFromDolphin(bean, 'innerBean', innerBean2, innerBean1);
        sinon.assert.calledWithExactly(element.beanChangeObserver, {path: 'theBean.innerBean', value: innerBean2, base: bean});
    }));



    it('should synchronize changes of a property of the nested Bean coming from Dolphin', sinon.test(function() {
        var element = new CustomElement();
        var innerBean = { theProperty: 'VALUE_1' };
        var bean = { innerBean: innerBean};
        this.stub(element, 'beanChangeObserver');

        element.bind('theBean', bean);
        element.beanChangeObserver.reset();

        innerBean.theProperty = 'VALUE_2';
        injectDataFromDolphin(innerBean, 'theProperty', 'VALUE_2', 'VALUE_1');
        sinon.assert.calledWithExactly(element.beanChangeObserver, {path: 'theBean.innerBean.theProperty', value: 'VALUE_2', base: bean});
    }));



    it('should not synchronize changes coming from Dolphin from an unbound root Bean', sinon.test(function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var bean1 = { innerBean: innerBean1};
        var innerBean2 = { theProperty: 'VALUE_X' };
        var bean2 = { innerBean: innerBean2};
        this.stub(element, 'beanChangeObserver');

        element.bind('theBean', bean1);
        element.bind('theBean', bean2);
        element.beanChangeObserver.reset();

        innerBean1.theProperty = 'VALUE_2';
        injectDataFromDolphin(innerBean1, 'theProperty', 'VALUE_2', 'VALUE_1');
        sinon.assert.notCalled(element.beanChangeObserver);
    }));



    it('should not synchronize changes coming from Dolphin from a nested Bean that was unbound through Dolphin', sinon.test(function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var innerBean2 = { theProperty: 'VALUE_X' };
        var bean = { innerBean: innerBean1};
        this.stub(element, 'beanChangeObserver');

        element.bind('theBean', bean);
        bean.innerBean = innerBean2;
        injectDataFromDolphin(bean, 'innerBean', innerBean2, innerBean1);
        element.beanChangeObserver.reset();

        innerBean1.theProperty = 'VALUE_2';
        injectDataFromDolphin(innerBean1, 'theProperty', 'VALUE_2', 'VALUE_1');
        sinon.assert.notCalled(element.beanChangeObserver);
    }));



    it('should not synchronize changes coming from Dolphin from a nested Bean that was unbound through Polymer', sinon.test(function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var innerBean2 = { theProperty: 'VALUE_X' };
        var bean = { innerBean: innerBean1};
        this.stub(element, 'beanChangeObserver');
        this.stub(dolphin, 'setAttribute').returns(innerBean1);

        element.bind('theBean', bean);
        element.set('theBean.innerBean', innerBean2);
        element.beanChangeObserver.reset();

        innerBean1.theProperty = 'VALUE_2';
        injectDataFromDolphin(innerBean1, 'theProperty', 'VALUE_2', 'VALUE_1');
        sinon.assert.notCalled(element.beanChangeObserver);
    }));



    it('should synchronize changes of the nested Bean coming from Polymer', sinon.test(function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var innerBean2 = { theProperty: 'VALUE_2' };
        var bean = { innerBean: innerBean1};
        var setAttributeStub = this.stub(dolphin, 'setAttribute');
        setAttributeStub.returns(innerBean1);

        element.bind('theBean', bean);

        element.set('theBean.innerBean', innerBean2);
        sinon.assert.calledWithExactly(dolphin.setAttribute, bean, 'innerBean', innerBean2);
    }));



    it('should synchronize changes of a property of the nested Bean coming from Polymer', sinon.test(function() {
        var element = new CustomElement();
        var innerBean = { theProperty: 'VALUE_1' };
        var bean = { innerBean: innerBean};
        var setAttributeStub = this.stub(dolphin, 'setAttribute');
        setAttributeStub.returns('VALUE_1');

        element.bind('theBean', bean);

        element.set('theBean.innerBean.theProperty', 'VALUE_2');
        sinon.assert.calledWithExactly(dolphin.setAttribute, innerBean, 'theProperty', 'VALUE_2');
    }));



    it('should not synchronize changes coming from Dolphin from an unbound root Bean', sinon.test(function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var bean1 = { innerBean: innerBean1};
        var innerBean2 = { theProperty: 'VALUE_X' };
        var bean2 = { innerBean: innerBean2};
        this.stub(element, 'beanChangeObserver');

        element.bind('theBean', bean1);
        element.bind('theBean', bean2);
        element.beanChangeObserver.reset();

        innerBean1.theProperty = 'VALUE_2';
        injectDataFromDolphin(innerBean1, 'theProperty', 'VALUE_2', 'VALUE_1');
        sinon.assert.notCalled(element.beanChangeObserver);
    }));



    it('should not synchronize changes coming from Polymer from a nested bean that was unbound through Dolphin', sinon.test(function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var innerBean2 = { theProperty: 'VALUE_X' };
        var bean = { innerBean: innerBean1};
        var setAttributeStub = this.stub(dolphin, 'setAttribute');

        element.bind('theBean', bean);
        bean.innerBean = innerBean2;
        injectDataFromDolphin(bean, 'innerBean', innerBean2, innerBean1);
        setAttributeStub.reset();
        setAttributeStub.returns('VALUE_X');

        element.set('theBean.innerBean.theProperty', 'VALUE_2');
        sinon.assert.calledWithExactly(dolphin.setAttribute, innerBean2, 'theProperty', 'VALUE_2');
    }));



    it('should not synchronize changes coming from Polymer from a nested bean that was unbound through Polymer', sinon.test(function() {
        var element = new CustomElement();
        var innerBean1 = { theProperty: 'VALUE_1' };
        var innerBean2 = { theProperty: 'VALUE_X' };
        var bean = { innerBean: innerBean1};
        var setAttributeStub = this.stub(dolphin, 'setAttribute');
        setAttributeStub.returns(innerBean1);

        element.bind('theBean', bean);
        element.set('theBean.innerBean', innerBean2);
        setAttributeStub.reset();
        setAttributeStub.returns('VALUE_X');

        element.set('theBean.innerBean.theProperty', 'VALUE_3');
        sinon.assert.calledWithExactly(dolphin.setAttribute, innerBean2, 'theProperty', 'VALUE_3');
    }));
});





describe('Deep Binding of an Array within an Array', function() {

    it('tests not defined yet', sinon.test(function() {
        expect.fail(null, null, "Test not implemented yet");
    }));
});





describe('Deep Binding of an Array within a Bean', function() {

    it('tests not defined yet', sinon.test(function() {
        expect.fail(null, null, "Test not implemented yet");
    }));
});





describe('Deep Binding of a Bean within an Array', function() {

    it('tests not defined yet', sinon.test(function() {
        expect.fail(null, null, "Test not implemented yet");
    }));
});
